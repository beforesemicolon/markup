import { booleanAttributes } from './utils/boolean-attributes'
import { setElementAttribute } from './utils/set-element-attribute'
import { parseDynamicRawValue } from './utils/parse-dynamic-raw-value'
import { ReactiveNode } from './ReactiveNode'
import { setNodeEventListener } from './utils/set-node-event-listener'
import { effect } from './state'
import { setElementDirectiveAttribute } from './utils/set-element-directive-attribute'
import { EffectUnSubscriber, ElementOptions } from './types'
import { HtmlTemplate } from './html'
import { renderContent } from './utils/render-content'

const node = (
    nodeName: string,
    ns: ElementOptions<unknown>['ns'] = '',
    values: Array<unknown> = [],
    refs: Record<string, Set<Element>> = {},
    cb: (item: EffectUnSubscriber | ReactiveNode | HtmlTemplate) => void
) => {
    const node =
        nodeName === '#fragment'
            ? document.createDocumentFragment()
            : document.createElementNS(ns, nodeName)
    const comp = customElements.get(nodeName.toLowerCase())
    const nodes: Array<Node | ReactiveNode | HtmlTemplate> = []

    return {
        __self__: node,
        __nodes__: nodes,
        namespaceURI: (node as Element).namespaceURI as string,
        tagName: node.nodeName,
        childNodes: node.childNodes,
        attributes: 'attributes' in node ? node.attributes : null,
        textContent: node.textContent,
        setAttribute: (name: string, value: string = '') => {
            // should ignore dynamically set attribute name
            if (/^val[0-9]+$/.test(name)) {
                return
            }

            const trimmedValue = value.trim()

            if (trimmedValue) {
                if (name === 'ref') {
                    if (!refs[trimmedValue]) {
                        refs[trimmedValue] = new Set()
                    }

                    refs[trimmedValue].add(node as Element)
                    return
                }

                const isBollAttr = booleanAttributes[name.toLowerCase()]

                // boolean attr with false value can just be ignored
                if (trimmedValue === 'false' && isBollAttr) {
                    return
                }

                const dvValue = parseDynamicRawValue(trimmedValue, values)

                if (
                    /^on[a-z]+/.test(name) && // @ts-expect-error observedAttributes is property of web component
                    ((comp && !comp?.observedAttributes?.includes(name)) ||
                        (document.head &&
                            // @ts-expect-error check if know event name
                            typeof document.head[name] !== 'undefined'))
                ) {
                    return setNodeEventListener(
                        name,
                        trimmedValue,
                        dvValue,
                        node
                    )
                }

                if (
                    isBollAttr ||
                    /^(class|style|data)/i.test(name) ||
                    trimmedValue.split(/\|/).length > 1
                ) {
                    let props: string[] = []
                    ;[name, ...props] = name.split('.')

                    const update = () =>
                        setElementDirectiveAttribute(
                            name,
                            props.join('.'),
                            dvValue,
                            node as HTMLElement
                        )

                    if (dvValue.some((n) => typeof n === 'function')) {
                        return cb(effect(() => update()))
                    }

                    return update()
                }

                if (typeof dvValue[0] === 'function') {
                    const fn = dvValue[0]
                    return cb(
                        effect(() =>
                            setElementAttribute(node as HTMLElement, name, fn())
                        )
                    )
                }

                return setElementAttribute(
                    node as HTMLElement,
                    name,
                    dvValue[0]
                )
            }

            if (
                // ignore special attributes specific to Markup that did not get handled
                !/^(ref|(class|style|data)\.)/.test(name)
            ) {
                setElementAttribute(node as HTMLElement, name, trimmedValue)
            }
        },
        appendChild: (n: DocumentFragment | Node) => {
            // @ts-expect-error __self__ is set by this node
            if (n.__self__) {
                // @ts-expect-error __self__ is set by this node
                n = n.__self__
            }

            if (n.nodeType === 3) {
                // text node
                if (n.nodeValue) {
                    for (const part of parseDynamicRawValue(
                        n.nodeValue,
                        values
                    )) {
                        if (typeof part === 'function') {
                            const rn = new ReactiveNode(
                                part as () => unknown,
                                node as HTMLElement
                            )
                            nodes.push(rn)
                            cb(rn)
                        } else {
                            nodes.push(
                                ...renderContent(
                                    part,
                                    node as HTMLElement,
                                    (item) => {
                                        if (item instanceof HtmlTemplate) {
                                            cb(item)
                                        }
                                    }
                                )
                            )
                        }
                    }
                }
            } else {
                node.appendChild(n)
                nodes.push(n)
            }
        },
    }
}

export const Doc = (
    values: Array<unknown>,
    refs: Record<string, Set<Element>>,
    cb: (item: EffectUnSubscriber | ReactiveNode | HtmlTemplate) => void
) => ({
    createTextNode: (text: string) => document.createTextNode(text),
    createComment: (text: string) => document.createComment(text),
    createDocumentFragment: () => node('#fragment', '', values, refs, cb),
    createElementNS: (ns: ElementOptions<unknown>['ns'], tagName: string) =>
        node(tagName, ns, values, refs, cb),
})
