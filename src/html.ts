import { parse } from '@beforesemicolon/html-parser/dist/parse'
import { EffectUnSubscriber } from './types'
import { ReactiveNode } from './ReactiveNode'
import { insertNodeAfter } from './utils/insert-node-after'
import { DocumentFragmentLike, ElementLike } from '@beforesemicolon/html-parser'
import { parseDynamicRawValue } from './utils/parse-dynamic-raw-value'
import { renderContent } from './utils/render-content'
import { booleanAttributes } from './utils/boolean-attributes'
import { val } from './helpers'
import { setElementAttribute } from './utils/set-element-attribute'
import { effect } from './state'
import { DoubleLinkedList } from './DoubleLinkedList'

const templateRegistry: Record<string, Template> = {}

interface AttributeSlot {
    type: 'attribute'
    name: string
    value: unknown
    nodeSelector: string
    valueParts: Array<string | number>
}

interface PropSlot {
    type: 'prop'
    name: string
    value: unknown
    nodeSelector: string
}

interface ContentSlot {
    type: 'content'
    value: string
    nodeId: string
    valueParts: Array<string | number>
}

type TemplateSlot = AttributeSlot | ContentSlot | PropSlot

interface Template {
    template: DocumentFragment
    slots: DoubleLinkedList<TemplateSlot>
}

const createId = () => Math.floor(Math.random() * 1000).toString()

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
            valueParts: parseDynamicRawValue(nodeValue),
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
    values: unknown[]
) {
    const tempId = parts.toString()

    if (templateRegistry[tempId]) {
        return templateRegistry[tempId]
    }

    let templateString = ''

    for (let i = 0; i < parts.length; i++) {
        const p = parts[i]
        templateString += i === parts.length - 1 ? p : p + `$val${i}`
    }

    templateString = templateString.trim()

    const slots = new DoubleLinkedList<TemplateSlot>()

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
                                    type: 'prop',
                                    name: key.toLowerCase(),
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
                        const v = value.trim()
                        slots.push({
                            type: 'attribute',
                            name: name.toLowerCase(),
                            value: v,
                            nodeSelector: `[data-slot-id="${id}"]`,
                            valueParts: parseDynamicRawValue(v),
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

    templateRegistry[tempId] = {
        // @ts-expect-error all elements have __self__
        template: temp.__self__,
        slots,
    }

    return templateRegistry[tempId]
}

function handleElementEventListener(
    node: Element,
    name: string,
    values: unknown[]
) {
    if (
        (node.nodeName.includes('-') &&
            // @ts-expect-error observedAttributes is property of web component
            !node.constructor?.observedAttributes?.includes(name)) ||
        // @ts-expect-error check if know event name
        typeof (document.head ?? {})[name] !== 'undefined'
    ) {
        let fn
        let options

        if (Array.isArray(values[0])) {
            ;[fn, options] = values[0]
        } else {
            fn = values[0]
        }

        if (typeof fn !== 'function') {
            throw new Error(
                `Handler for event "${name}" is not a function. Found "${fn}".`
            )
        }

        node.addEventListener(name.slice(2), fn, options)

        return true
    }

    return false
}

export function handleElementAttribute(
    node: Element,
    name: string,
    values: unknown[],
    cb: (item: EffectUnSubscriber) => void
) {
    if (
        name.slice(0, 2) === 'on' &&
        handleElementEventListener(node, name, values)
    ) {
        node.removeAttribute(name)
        return
    }

    const hasFunctionValue = values.some((d) => typeof d === 'function')

    if (booleanAttributes[name]) {
        const d = values[0]

        const setAttr = (prevValue?: unknown) => {
            const newValue = val(d)

            if (newValue !== prevValue) {
                if (newValue) {
                    setElementAttribute(node, name, newValue)
                } else {
                    ;(node as Element).removeAttribute(name)
                }
            }

            return newValue
        }

        if (typeof d === 'function') {
            return cb(effect(setAttr))
        }

        return setAttr(false)
    }

    const setAttr = (prevValue?: unknown) => {
        const newValue =
            values.length === 1
                ? val(values[0])
                : values.map((d) => val(d)).join('')

        if (newValue !== prevValue) setElementAttribute(node, name, newValue)

        return newValue
    }

    if (hasFunctionValue) {
        return cb(effect(setAttr))
    }

    return setAttr()
}

export class HtmlTemplate {
    #template: Template
    #refs: Record<string, Set<Element>> = {}
    #effectUnsubs: Set<EffectUnSubscriber> = new Set()
    #values: Array<unknown> = []
    #mounted = false
    #mountSub: (() => void | (() => void)) | undefined = undefined
    #moveSub: (() => void | (() => void)) | undefined = undefined
    #unmountSub: (() => void) | undefined = undefined
    #updateSub: (() => void) | undefined = undefined
    #markers = [document.createTextNode(''), document.createTextNode('')]
    __PARENT__: HtmlTemplate | null = null
    __CHILDREN__: Set<ReactiveNode | HtmlTemplate> = new Set()

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
        const childRefs = Array.from(this.__CHILDREN__).reduce((acc, item) => {
            return {
                ...acc,
                ...item.refs,
            }
        }, {})

        return Object.freeze({
            ...childRefs,
            ...Object.entries(this.#refs).reduce(
                (acc, [key, set]) => ({
                    ...acc,
                    [key]: Array.from(set),
                }),
                {}
            ),
        })
    }

    get mounted() {
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
        this.#template = createTemplate(parts, values)
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
            if (this.mounted) {
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
                target.__PARENT__?.__CHILDREN__.add(this)
                this.__PARENT__ = target.__PARENT__
                target.unmount()
            }

            // only try to replace elements that are actually rendered anywhere
            if (element?.parentNode) {
                if (this.mounted) {
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

            if (this.mounted) {
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

            if (target instanceof HtmlTemplate) {
                this.__PARENT__ = target.__PARENT__
                this.__PARENT__?.__CHILDREN__.add(this)
            }

            return this
        }

        throw new Error(
            `Invalid "insertAfter" target element. Received ${target}`
        )
    }

    unmount() {
        if (this.mounted) {
            this.#mounted = false
            for (const effectUnsub of this.#effectUnsubs) {
                effectUnsub()
            }

            for (const item of this.__CHILDREN__) {
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
            this.__PARENT__?.__CHILDREN__.delete(this)
            this.__CHILDREN__.clear()
            this.__PARENT__ = null
            this.#refs = {}
            this.#effectUnsubs.clear()
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

    toString() {
        if (!this.#mounted) {
            this.render(document.createElement('div'))
            const str = this.childNodes
                .map((node) =>
                    node instanceof Element ? node.outerHTML : node.nodeValue
                )
                .join('')
            this.unmount()
            return str
        }

        return this.childNodes
            .map((node) =>
                node instanceof Element ? node.outerHTML : node.nodeValue
            )
            .join('')
    }

    #init(actionType: 'render' | 'replace' | 'after', element: Node) {
        const { template, slots } = this.#template
        const frag = template.cloneNode(true) as DocumentFragment
        const nodes: Record<string, HTMLElement> = {}

        for (const slot of slots) {
            if (slot.type === 'attribute' || slot.type === 'prop') {
                const node =
                    nodes[slot.nodeSelector] ??
                    frag.querySelector(slot.nodeSelector)

                if (node) {
                    nodes[slot.nodeSelector] = node
                    node.removeAttribute('data-slot-id')
                    let values = []

                    if (slot.type === 'attribute') {
                        if (slot.name === 'ref') {
                            const name = String(slot.value)

                            if (!this.#refs[name]) {
                                this.#refs[name] = new Set()
                            }

                            this.#refs[name].add(node)
                            continue
                        }

                        for (const p of slot.valueParts) {
                            values.push(
                                typeof p === 'number' ? this.#values[p] : p
                            )
                        }
                    } else {
                        values = [slot.value]
                    }

                    handleElementAttribute(node, slot.name, values, (item) =>
                        this.#effectUnsubs.add(item)
                    )
                }
            } else {
                const node =
                    nodes[slot.nodeId] ?? frag.getElementById(slot.nodeId)

                if (node) {
                    nodes[slot.nodeId] = node
                    const parentNode = node.parentNode as HTMLElement
                    const cont = document.createDocumentFragment()

                    for (const p of slot.valueParts) {
                        const part = typeof p === 'number' ? this.#values[p] : p

                        if (typeof part === 'function') {
                            const rn = new ReactiveNode(
                                part as () => unknown,
                                cont,
                                this
                            )

                            this.__CHILDREN__.add(rn)

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
                                    item.__PARENT__ = this
                                    this.__CHILDREN__.add(item)
                                }
                            })
                        }
                    }

                    node.parentNode?.replaceChild(cont, node)
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
