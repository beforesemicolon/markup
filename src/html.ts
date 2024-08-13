import { parse } from '@beforesemicolon/html-parser/dist/parse'
import { EffectUnSubscriber } from './types'
import { ReactiveNode } from './ReactiveNode'
import { insertNodeAfter } from './utils/insert-node-after'
import { DocumentFragmentLike, ElementLike } from '@beforesemicolon/html-parser'
import { parseDynamicRawValue } from './utils/parse-dynamic-raw-value'
import { renderContent } from './utils/render-content'
import { setNodeEventListener } from './utils/set-node-event-listener'
import { booleanAttributes } from './utils/boolean-attributes'
import { val } from './helpers'
import { setElementAttribute } from './utils/set-element-attribute'
import { effect } from './state'

const templateRegistry: Record<string, Template> = {}

interface AttributeSlot {
    type: 'attribute'
    name: string
    value: unknown
    nodeSelector: string
}

interface ContentSlot {
    type: 'content'
    value: string
    nodeId: string
}

type TemplateSlot = AttributeSlot | ContentSlot

interface Template {
    template: DocumentFragment
    slots: TemplateSlot[]
}

const createId = () => Math.floor(Math.random() * Date.now()).toString()

const handleTextNode = (nodeValue: string, el: DocumentFragment | Element) => {
    if (/\$val([0-9]+)/.test(nodeValue)) {
        const nodeId = createId()
        const script = document.createElement('script')
        script.id = nodeId

        el.appendChild(script)

        return {
            type: 'content',
            value: nodeValue,
            nodeId,
        } as ContentSlot
    }
}

const handleAppendChild = (
    n: Node,
    parentNode: Element | DocumentFragment
): ContentSlot | void => {
    if (n instanceof Text) {
        const res = handleTextNode(n.nodeValue ?? '', parentNode)

        if (res) {
            return res
        }
    }

    parentNode.appendChild(n)
}

function createTemplate(
    parts: TemplateStringsArray | string[],
    ...values: unknown[]
) {
    const templateString = parts
        .map((s, i) => {
            return i === parts.length - 1 ? s : s + `$val${i}`
        })
        .join('')
        .trim()

    if (templateRegistry[templateString]) {
        return templateRegistry[templateString]
    }

    const slots: TemplateSlot[] = []

    const temp = parse(templateString, {
        createComment: (value) => document.createComment(value),
        createTextNode: (value) => document.createTextNode(value),
        createDocumentFragment: () => {
            const __self__ = document.createDocumentFragment()

            return {
                __self__,
                children: __self__.children,
                appendChild: (node: Node & { __self__: Node }) => {
                    const slot = handleAppendChild(
                        node.__self__ ?? node,
                        __self__
                    )
                    if (slot) slots.push(slot)
                },
            } as unknown as DocumentFragmentLike
        },
        createElementNS: (namespace: string, tagName: string) => {
            const id = createId()
            const __self__ = document.createElementNS(namespace, tagName)

            return {
                __self__,
                namespace,
                tagName: __self__.tagName,
                children: __self__.children,
                attributes: __self__.attributes,
                appendChild(node: Node & { __self__: Node }) {
                    const slot = handleAppendChild(
                        node.__self__ ?? node,
                        __self__
                    )
                    if (slot) slots.push(slot)
                },
                setAttribute(name: string, value: string) {
                    const dynamicValue = name.match(/^val([0-9]+)$/)
                    // should ignore dynamically set attribute name
                    if (dynamicValue) {
                        const idx = Number(dynamicValue[1])
                        const attrs = values[idx]

                        if (`${attrs}` === '[object Object]') {
                            __self__.setAttribute('data-slot-id', id)

                            for (const [key, v] of Object.entries(
                                attrs as Record<string, string>
                            )) {
                                slots.push({
                                    type: 'attribute',
                                    name: key,
                                    value: v,
                                    nodeSelector: `[data-slot-id="${id}"]`,
                                })
                            }
                            return
                        }

                        throw new Error(
                            `Invalid attribute object provided: ${attrs}`
                        )
                    }

                    if (name === 'ref' || /\$val([0-9]+)/.test(value)) {
                        __self__.setAttribute('data-slot-id', id)
                        slots.push({
                            type: 'attribute',
                            name,
                            value,
                            nodeSelector: `[data-slot-id="${id}"]`,
                        })

                        // skip setting attribute for Web Components as they can have non-primitive values
                        // and will be handled by the "setElementAttribute" util
                        if (tagName.includes('-')) return
                    }

                    name !== 'ref' && __self__.setAttribute(name, value)
                },
            } as unknown as ElementLike
        },
    })

    templateRegistry[templateString] = {
        // @ts-expect-error all elements have __self__
        template: temp.__self__,
        slots,
    }

    return templateRegistry[templateString]
}

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

export function handleElementAttribute(
    node: Element,
    name: string,
    value: string,
    refs: Record<string, Set<Element>> = {},
    values: unknown[],
    cb: (item: EffectUnSubscriber) => void
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

            if (set) {
                node.removeAttribute(name)
                return
            }
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

export class HtmlTemplate {
    #template: Template
    #mountables: Array<ReactiveNode | HtmlTemplate> = []
    #refs: Record<string, Set<Element>> = {}
    #effectUnsubs: Set<EffectUnSubscriber> = new Set()
    #values: Array<unknown> = []
    #mounted = false
    #mountSub: (() => void | (() => void)) | undefined = undefined
    #moveSub: (() => void | (() => void)) | undefined = undefined
    #unmountSub: (() => void) | undefined = undefined
    #updateSub: (() => void) | undefined = undefined
    #markers = [document.createTextNode(''), document.createTextNode('')]

    /**
     * the Element or ShadowRoot instance provided in the render method
     */
    get parentNode(): ParentNode | null {
        return this.#markers[0].parentNode
    }

    get childNodes() {
        const nodes = []

        let node = this.#markers[0].nextSibling
        while (node && node !== this.#markers[1]) {
            nodes.push(node)
            node = node.nextSibling
        }
        return nodes
    }

    /**
     * map of DOM element references keyed by the name provided as the ref attribute value
     */
    get refs(): Record<string, Array<Element>> {
        const childRefs = this.#mountables.reduce((acc, item) => {
            if (item instanceof HtmlTemplate || item instanceof ReactiveNode) {
                return {
                    ...acc,
                    ...item.refs,
                }
            }

            return acc
        }, {})

        return Object.freeze({
            ...childRefs,
            ...Object.entries(this.#refs).reduce(
                (acc, [key, set]) => ({
                    ...acc,
                    [key]: Array.from(new Set(Array.from(set))),
                }),
                {}
            ),
        })
    }

    get isConnected() {
        return this.#mounted
    }

    /**
     * @deprecated
     * internally used nodes to mark the beginning and end of nodes belonging to this template.
     *
     * DO NOT USE or RELY on IT!
     */
    get __MARKERS__() {
        return this.#markers
    }

    constructor(parts: TemplateStringsArray | string[], values: unknown[]) {
        this.#values = values
        this.#template = createTemplate(parts, ...values)
    }

    /**
     * appends the template on the provided Element or ShadowRoot instance
     * @param elementToAttachNodesTo
     * @param force
     */
    render(
        elementToAttachNodesTo:
            | ShadowRoot
            | HTMLElement
            | Element
            | DocumentFragment
    ) {
        if (
            elementToAttachNodesTo &&
            elementToAttachNodesTo !== this.parentNode &&
            (elementToAttachNodesTo instanceof ShadowRoot ||
                elementToAttachNodesTo instanceof Element ||
                elementToAttachNodesTo instanceof DocumentFragment)
        ) {
            if (this.isConnected) {
                elementToAttachNodesTo.append(
                    this.#markers[0],
                    ...this.childNodes,
                    this.#markers[1]
                )
                if (!(elementToAttachNodesTo instanceof DocumentFragment)) {
                    this.#moveSub?.()
                }
            } else {
                this.#init('render', elementToAttachNodesTo)
            }
        }

        return this
    }

    /**
     * replaces the target element with the template nodes. Does not replace HEAD, BODY, HTML, and ShadowRoot elements
     * @param target
     */
    replace(target: Node | HtmlTemplate) {
        if (
            target instanceof HtmlTemplate ||
            (target instanceof Node &&
                !(
                    target instanceof ShadowRoot ||
                    target instanceof HTMLBodyElement ||
                    target instanceof HTMLHeadElement ||
                    target instanceof HTMLHtmlElement
                ))
        ) {
            let element = target

            if (target instanceof HtmlTemplate) {
                element = document.createTextNode('') as Node
                target.__MARKERS__[0].parentNode?.insertBefore(
                    element,
                    target.__MARKERS__[0]
                )
                target.unmount()
            }

            // only try to replace elements that are actually rendered anywhere
            if (!element) {
                return
            }

            if (this.isConnected) {
                const frag = document.createDocumentFragment()
                frag.append(
                    this.#markers[0],
                    ...this.childNodes,
                    this.#markers[1]
                )
                element?.parentNode?.replaceChild(frag, element as Node)

                if (!(target instanceof DocumentFragment)) {
                    this.#moveSub?.()
                }
            } else {
                this.#init('replace', element as Node)
            }

            return this
        }

        throw new Error(`Invalid "replace" target element. Received ${target}`)
    }

    insertAfter(target: Node | HtmlTemplate) {
        if (
            target instanceof HtmlTemplate ||
            (target instanceof Node &&
                !(
                    target instanceof ShadowRoot ||
                    target instanceof HTMLBodyElement ||
                    target instanceof HTMLHeadElement ||
                    target instanceof HTMLHtmlElement
                ))
        ) {
            const element =
                target instanceof HtmlTemplate ? target.__MARKERS__[1] : target

            if (this.isConnected) {
                if (element.nextSibling !== this.#markers[0]) {
                    const frag = document.createDocumentFragment()
                    frag.append(
                        this.#markers[0],
                        ...this.childNodes,
                        this.#markers[1]
                    )
                    insertNodeAfter(frag, element)
                    if (!(target instanceof DocumentFragment)) {
                        this.#moveSub?.()
                    }
                }
            } else {
                this.#init('after', element as Node)
            }

            return this
        }

        throw new Error(
            `Invalid "insertAfter" target element. Received ${target}`
        )
    }

    unmount() {
        if (this.isConnected) {
            for (const effectUnsub of this.#effectUnsubs) {
                effectUnsub()
            }

            for (const item of this.#mountables) {
                item.unmount()
            }

            let node = this.#markers[0].nextSibling

            while (node && node !== this.#markers[1]) {
                const next = node.nextSibling
                node.remove()
                node = next
            }

            this.#markers[0].remove()
            this.#markers[1].remove()
            this.#mountables = []
            this.#mounted = false
            this.#unmountSub?.()
        }
    }

    onMount(cb: () => void) {
        this.#mountSub = cb
        return this
    }

    onUpdate(cb: () => void) {
        this.#updateSub = cb
        return this
    }

    onMove(cb: () => void) {
        this.#moveSub = cb
        return this
    }

    #init(actionType: 'render' | 'replace' | 'after', element: Node) {
        const { template, slots } = this.#template
        const frag = template.cloneNode(true) as DocumentFragment
        const nodes: Record<string, HTMLElement> = {}

        for (const slot of slots) {
            if (slot.type === 'attribute') {
                const node =
                    nodes[slot.nodeSelector] ??
                    frag.querySelector(slot.nodeSelector)

                if (node) {
                    node.removeAttribute('data-slot-id')
                    handleElementAttribute(
                        node,
                        slot.name,
                        typeof slot.value === 'string' ? slot.value : `$val0`,
                        this.#refs,
                        typeof slot.value === 'string'
                            ? this.#values
                            : [slot.value],
                        (item) => this.#effectUnsubs.add(item)
                    )
                    nodes[slot.nodeSelector] = node
                }
            } else {
                const node =
                    nodes[slot.nodeId] ?? frag.getElementById(slot.nodeId)

                if (node) {
                    const parentNode = node.parentNode as HTMLElement
                    const cont = document.createDocumentFragment()

                    parseDynamicRawValue(slot.value, this.#values, (part) => {
                        if (typeof part === 'function') {
                            const rn = new ReactiveNode(
                                part as () => unknown,
                                cont
                            )
                            this.#mountables.push(rn)

                            // the root node will be a document fragment which means
                            // item will be a direct child
                            if (parentNode instanceof DocumentFragment) {
                                rn.updateParentReference(element as HTMLElement)
                            } else {
                                rn.updateParentReference(parentNode)
                            }

                            rn.onUpdate(() => {
                                this.#updateSub?.()
                            })
                        } else {
                            renderContent(part, cont, (item) => {
                                if (item instanceof HtmlTemplate) {
                                    this.#mountables.push(item)
                                }
                            })
                        }
                    })

                    node.parentNode?.replaceChild(cont, node)
                    nodes[slot.nodeId] = node
                }
            }
        }

        frag.prepend(this.#markers[0])
        frag.append(this.#markers[1])

        if (actionType === 'replace') {
            element?.parentNode?.replaceChild(frag, element)
        } else if (actionType === 'after') {
            insertNodeAfter(frag, element)
        } else {
            element.appendChild(frag)
        }

        this.#mounted = true
        const res = this.#mountSub?.()

        if (typeof res === 'function') {
            this.#unmountSub = res
        }
    }
}

/**
 * html template literal tag function
 * @param parts
 * @param values
 */
export const html = (
    parts: TemplateStringsArray | string[],
    ...values: unknown[]
) => new HtmlTemplate(parts, values)
