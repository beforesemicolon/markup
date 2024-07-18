import { booleanAttributes } from './utils/boolean-attributes'
import { setElementAttribute } from './utils/set-element-attribute'
import { parseDynamicRawValue } from './utils/parse-dynamic-raw-value'
import { ReactiveNode } from './ReactiveNode'
import { setNodeEventListener } from './utils/set-node-event-listener'
import { effect } from './state'
import { EffectUnSubscriber, ElementOptions } from './types'
import { HtmlTemplate } from './html'
import { renderContent } from './utils/render-content'
import { val } from './utils/val'

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
            const dynamicValue = name.match(/^val([0-9]+)$/)
            // should ignore dynamically set attribute name
            if (dynamicValue) {
                const idx = Number(dynamicValue[1])
                const attrs = values[idx]

                if (`${attrs}` === '[object Object]') {
                    for (const [key, v] of Object.entries(
                        attrs as Record<string, unknown>
                    )) {
                        handleElementAttribute(
                            node as Element,
                            key,
                            `$val0`,
                            refs,
                            [v],
                            cb
                        )
                    }
                    return
                }

                throw new Error(`Invalid attribute object provided: ${attrs}`)
            }

            handleElementAttribute(
                node as Element,
                name,
                value,
                refs,
                values,
                cb
            )
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
                    parseDynamicRawValue(n.nodeValue, values, (part) => {
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
                    })
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

function handleElementEventListener(
    node: Element,
    name: string,
    value: string,
    values: unknown[]
) {
    const comp = customElements.get(node.nodeName.toLowerCase())

    if (
        // @ts-expect-error observedAttributes is property of web component
        (comp && !comp?.observedAttributes?.includes(name)) ||
        (document.head &&
            // @ts-expect-error check if know event name
            typeof document.head[name] !== 'undefined')
    ) {
        const [fnString, optString] = value.split(',').map((p) => p.trim())
        const [, idx] = fnString.match(/\$val([0-9]+)/) ?? []
        const fn = values[Number(idx)]
        let options: boolean | AddEventListenerOptions | undefined

        if (optString) {
            if (/^(true|false)$/.test(optString)) {
                options = /^true$/.test(optString)
            } else {
                const [, oIdx] = optString.match(/\$val([0-9]+)/g) ?? []
                options = values[Number(oIdx)] as AddEventListenerOptions
            }
        }

        setNodeEventListener(node, name, fn as EventListener, options)
        return true
    }

    return false
}

function handleElementAttribute(
    node: Element,
    name: string,
    value: string,
    refs: Record<string, Set<Element>> = {},
    values: unknown[],
    cb: (item: EffectUnSubscriber | ReactiveNode | HtmlTemplate) => void
) {
    const trimmedValue = value.trim()

    if (trimmedValue) {
        if (name === 'ref') {
            if (!refs[trimmedValue]) {
                refs[trimmedValue] = new Set()
            }

            refs[trimmedValue].add(node)
            return
        }

        if (/^on[a-z]+/.test(name)) {
            const set = handleElementEventListener(
                node,
                name,
                trimmedValue,
                values
            )

            if (set) return
        }

        let hasFunctionValue = false
        const dvValue = parseDynamicRawValue(trimmedValue, values, (d) => {
            hasFunctionValue = !hasFunctionValue && typeof d === 'function'
        })

        if (booleanAttributes[name.toLowerCase()]) {
            const d = dvValue[0]

            const setAttr = () => {
                const v = val(d)
                if (v) {
                    setElementAttribute(node, name, v)
                } else {
                    ;(node as Element).removeAttribute(name)
                }
            }

            if (typeof d === 'function') {
                return cb(effect(setAttr))
            }

            return setAttr()
        }

        const setAttr = () =>
            setElementAttribute(
                node,
                name,
                dvValue.length === 1
                    ? val(dvValue[0])
                    : dvValue.map((d) => val(d)).join('')
            )

        if (hasFunctionValue) {
            return cb(effect(setAttr))
        }

        return setAttr()
    }

    if (name !== 'ref') {
        setElementAttribute(node as HTMLElement, name, trimmedValue)
    }
}
