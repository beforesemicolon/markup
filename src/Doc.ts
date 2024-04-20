import {
    booleanAttributes,
    element,
    ElementOptions,
    setElementAttribute,
} from './utils'
import { ContentDynamicValueResolver } from './dynamic-value/ContentDynamicValueResolver'
import { EventDynamicValueResolver } from './dynamic-value/EventDynamicValueResolver'
import { DirectiveDynamicValueResolver } from './dynamic-value/DirectiveDynamicValueResolver'
import { AttributeDynamicValueResolver } from './dynamic-value/AttributeDynamicValueResolver'
import { isDynamicValue } from './dynamic-value/is-dynamic-value'
import { parseDynamicRawValue } from './dynamic-value/parse-dynamic-raw-value'

type DynamicValueCallback = (
    dynamicVal:
        | ContentDynamicValueResolver
        | EventDynamicValueResolver
        | DirectiveDynamicValueResolver
        | AttributeDynamicValueResolver
) => void

const node = (
    nodeName: string,
    ns: ElementOptions<unknown>['ns'] = '',
    values: Array<unknown> = [],
    refs: Record<string, Set<Element>> = {},
    cb: DynamicValueCallback = () => {}
) => {
    const node =
        nodeName === '#fragment'
            ? document.createDocumentFragment()
            : element(nodeName, { ns })
    const comp = customElements.get(nodeName.toLowerCase())

    return {
        __self__: node,
        namespaceURI: (node as Element).namespaceURI as string,
        tagName: nodeName,
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

                const attrLessName = name.replace(/^attr\./, '')
                const isBollAttr = booleanAttributes[attrLessName.toLowerCase()]

                // boolean attr with false value can just be ignored
                if (trimmedValue === 'false' && isBollAttr) {
                    return
                }

                const parts = parseDynamicRawValue(trimmedValue, values)
                const dvValue = parts.map((p) =>
                    typeof p === 'string' ? p : p.value
                )
                const partsWithDynamicValues = dvValue.some(isDynamicValue)

                if (
                    /^on[a-z]+/.test(name) && // @ts-expect-error observedAttributes is property of web component
                    ((comp && !comp?.observedAttributes?.includes(name)) ||
                        (document.head &&
                            // @ts-expect-error check if know event name
                            typeof document.head[name] !== 'undefined'))
                ) {
                    return cb(
                        new EventDynamicValueResolver(
                            name,
                            trimmedValue,
                            dvValue,
                            [node],
                            name.slice(2)
                        )
                    )
                }

                if (
                    isBollAttr ||
                    /^(attr|class|style|data)/i.test(name) ||
                    trimmedValue.split(/\|/).length > 1
                ) {
                    let props: string[] = []
                    ;[name, ...props] = attrLessName.split('.')

                    const dynVal = new DirectiveDynamicValueResolver(
                        name,
                        trimmedValue,
                        dvValue,
                        [node],
                        props.join('.')
                    )

                    if (partsWithDynamicValues) {
                        cb(dynVal)
                    } else {
                        dynVal.resolve()
                    }

                    return
                }

                if (partsWithDynamicValues) {
                    return cb(
                        new AttributeDynamicValueResolver(
                            name,
                            trimmedValue,
                            dvValue,
                            [node]
                        )
                    )
                }

                return setElementAttribute(node as Element, name, dvValue[0])
            }

            if (
                // ignore special attributes specific to Markup that did not get handled
                !/^(ref|(attr|class|style|data)\.)/.test(name)
            ) {
                setElementAttribute(node as Element, name, trimmedValue)
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
                    const parts = parseDynamicRawValue(n.nodeValue, values)

                    parts.forEach((part) => {
                        if (part) {
                            if (
                                typeof part !== 'string' &&
                                isDynamicValue(part.value)
                            ) {
                                const txtNode = document.createTextNode(
                                    part.text
                                )
                                node.appendChild(txtNode)

                                cb(
                                    new ContentDynamicValueResolver(
                                        'nodeValue',
                                        part.text,
                                        part.value,
                                        [txtNode]
                                    )
                                )
                            } else {
                                node.appendChild(
                                    document.createTextNode(String(part))
                                )
                            }
                        }
                    })
                }
            } else {
                node.appendChild(n as Node)
            }
        },
    }
}

export const Doc = (
    values: Array<unknown>,
    refs: Record<string, Set<Element>>,
    cb: DynamicValueCallback
) => ({
    createTextNode: (text: string) => document.createTextNode(text),
    createComment: (text: string) => document.createComment(text),
    createDocumentFragment: () => node('#fragment', '', values, refs, cb),
    createElementNS: (ns: ElementOptions<unknown>['ns'], tagName: string) =>
        node(tagName, ns, values, refs, cb),
})
