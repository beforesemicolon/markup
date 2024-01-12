import { ExecutableValue } from '../types'
import { extractExecutableValueFromRawValue } from './extract-executable-value-from-raw-value'
import {
    handleAttrDirectiveExecutableValue,
    handleAttrExecutableValue,
    handleEventExecutableValue,
    handleTextExecutableValue,
} from './handle-executable'
import {
    booleanAttributes,
    element,
    ElementOptions,
    setElementAttribute,
} from '../utils'

const node = (
    nodeName: string,
    ns: ElementOptions<unknown>['ns'] = '',
    values: Array<unknown> = [],
    refs: Record<string, Set<Element>> = {},
    cb: (node: Node, e: ExecutableValue, type: string) => void = () => {}
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
                const isBollAttr =
                    booleanAttributes[
                        attrLessName.toLowerCase() as keyof typeof booleanAttributes
                    ]

                // boolean attr with false value can just be ignored
                if (trimmedValue === 'false' && isBollAttr) {
                    return
                }

                let e: ExecutableValue = {
                    name,
                    value: trimmedValue,
                    rawValue: trimmedValue,
                    renderedNodes: [node],
                    parts: /^(true|false)$/.test(trimmedValue)
                        ? [Boolean(trimmedValue)]
                        : extractExecutableValueFromRawValue(
                              trimmedValue,
                              values
                          ),
                }

                if (/^on[a-z]+/.test(name)) {
                    // if the node happen to have
                    if (comp) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if (!comp?.observedAttributes?.includes(name)) {
                            e.prop = name.slice(2)
                        }
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    } else if (
                        document.head &&
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        typeof document.head[name] !== 'undefined'
                    ) {
                        // ignore unknown events
                        e.prop = name.slice(2)
                    }

                    if (e.prop) {
                        handleEventExecutableValue(e)
                        cb(node, e, 'events')
                        return
                    }
                }

                if (
                    isBollAttr ||
                    /^(attr|class|style|data)/i.test(name) ||
                    trimmedValue.split(/\|/).length > 1
                ) {
                    let props: string[] = []
                    ;[name, ...props] = attrLessName.split('.')

                    e = {
                        ...e,
                        name,
                        value: '',
                        prop: props.join('.'),
                    }

                    handleAttrDirectiveExecutableValue(e)
                    return cb(node, e, 'directives')
                }

                if (/{{val[0-9]+}}/.test(trimmedValue)) {
                    handleAttrExecutableValue(e, node as Element)
                    return cb(node, e, 'attributes')
                }
            }

            if (
                'setAttribute' in node &&
                // ignore special attributes specific to Markup that did not get handled
                !/^(ref|(attr|class|style|data)\.)/.test(name)
            ) {
                setElementAttribute(node, name, trimmedValue)
            }
        },
        appendChild: (n: DocumentFragment | Node) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (n.__self__) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                n = n.__self__
            }

            if (n.nodeType === 3) {
                // text node
                node.appendChild(n)

                if (n.nodeValue && /{{val([0-9]+)}}/.test(n.nodeValue)) {
                    const value = String(n.nodeValue)
                    const e: ExecutableValue = {
                        name: 'nodeValue',
                        rawValue: value,
                        value,
                        parts: extractExecutableValueFromRawValue(
                            value,
                            values
                        ),
                        renderedNodes: [n],
                    }

                    cb(n, e, 'content')
                    handleTextExecutableValue(e, refs, n)
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
    cb: (node: Node, e: ExecutableValue, type: string) => void
) => {
    return {
        createTextNode: (text: string) => {
            return document.createTextNode(text)
        },
        createComment: (text: string) => {
            return document.createComment(text)
        },
        createDocumentFragment: () => {
            return node('#fragment', '', values, refs, cb)
        },
        createElementNS: (
            ns: ElementOptions<unknown>['ns'],
            tagName: string
        ) => {
            return node(tagName, ns, values, refs, cb)
        },
    }
}
