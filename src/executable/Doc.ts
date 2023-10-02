import { ExecutableValue } from '../types'
import { extractExecutableValueFromRawValue } from './extract-executable-value-from-raw-value'
import {
    handleAttrDirectiveExecutableValue,
    handleAttrExecutableValue,
    handleEventExecutableValue,
    handleTextExecutableValue,
} from './handle-executable'

const node = (
    nodeName: string,
    ns = '',
    values: Array<unknown> = [],
    refs: Record<string, Set<Element>> = {},
    cb: (node: Node, e: ExecutableValue, type: string) => void = () => {}
) => {
    const node =
        nodeName === '#fragment'
            ? document.createDocumentFragment()
            : document.createElementNS(ns, nodeName)
    const comp = customElements.get(nodeName.toLowerCase())

    return {
        get __self__() {
            return node
        },
        get nodeName() {
            return nodeName
        },
        get childNodes() {
            return node.childNodes
        },
        get children() {
            return node.children
        },
        get attributes() {
            return node instanceof Element ? node.attributes : null
        },
        get lastElementChild() {
            return node instanceof Element ? node.lastElementChild : null
        },
        get textContent(): string | null {
            return node instanceof Element ? node.textContent : null
        },
        set textContent(value: string) {
            if (node instanceof Element) {
                node.textContent = value
            }
        },
        setAttribute: (name: string, value: string = '') => {
            if (/^val[0-9]+$/.test(name)) {
                return
            }

            let e: ExecutableValue = {
                name,
                value,
                rawValue: value,
                renderedNode: node,
                parts: extractExecutableValueFromRawValue(value, values),
            }

            if (/^on[a-z]+/.test(name)) {
                // if the node happen to have
                if (comp) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (comp?.observedAttributes?.includes(name)) {
                        return
                    }
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                } else if (
                    document.head &&
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    typeof document.head[name] === 'undefined'
                ) {
                    // ignore unknown events
                    return
                }

                e = {
                    ...e,
                    prop: name.slice(2),
                }

                handleEventExecutableValue(e)
                cb(node, e, 'events')
            } else if (/^(attr|ref)/.test(name)) {
                // element.removeAttribute(name);

                if (name === 'ref') {
                    if (!refs[value]) {
                        refs[value] = new Set()
                    }

                    refs[value].add(node as Element)
                } else {
                    const isAttrOrBind = name.match(/(attr)\.([a-z0-9-.]+)/)
                    const prop = isAttrOrBind ? isAttrOrBind[2] : ''
                    e = {
                        ...e,
                        name: name.slice(0, name.indexOf('.')),
                        value: '',
                        prop,
                    }

                    handleAttrDirectiveExecutableValue(e)
                    cb(node, e, 'directives')
                }
            } else if (/{{val[0-9]+}}/.test(value)) {
                handleAttrExecutableValue(e, node as Element)
                cb(node, e, 'attributes')
            } else if ('setAttribute' in node) {
                node.setAttribute(name, value)
            }
        },
        appendChild: (n: DocumentFragment | Node | Array<Node> | string) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (n.__self__) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                n = n.__self__
            }

            if (n instanceof DocumentFragment) {
                n.childNodes.forEach((N) => {
                    node.appendChild(N)
                })
            } else if (Array.isArray(n)) {
                n.forEach((N) => {
                    node.appendChild(N)
                })
            } else {
                node.appendChild(n as Node)
            }
        },
    }
}

const createTextNode = (
    value: string,
    values: Array<unknown>,
    refs: Record<string, Set<Element>>,
    cb: (node: Node, e: ExecutableValue, type: string) => void
) => {
    const txt = document.createTextNode(value)

    if (/{{val([0-9]+)}}/.test(value)) {
        const div = document.createElement('div')
        div.appendChild(txt)

        const e: ExecutableValue = {
            name: 'nodeValue',
            rawValue: value,
            value,
            parts: extractExecutableValueFromRawValue(value, values),
            renderedNode: txt,
        }

        handleTextExecutableValue(e, refs, txt)

        cb(txt, e, 'content')

        if (txt === e.renderedNode) {
            txt.nodeValue = e.parts.join('')
            return txt
        }

        return e.renderedNode
    }

    return txt
}

export const Doc = (
    values: Array<unknown>,
    refs: Record<string, Set<Element>>,
    cb: (node: Node, e: ExecutableValue, type: string) => void
) => ({
    createTextNode: (value: string) => createTextNode(value, values, refs, cb),
    createComment: document.createComment,
    createDocumentFragment: () => node('#fragment'),
    createElementNS: (ns: string, tagName: string) =>
        node(tagName, ns, values, refs, cb),
})
