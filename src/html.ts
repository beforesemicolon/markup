import {
    parse,
    DocumentFragmentLike,
    ElementLike,
} from '@beforesemicolon/html-parser'
import {
    EffectUnSubscriber,
    LifecycleCallback,
    ObjectLiteral,
} from './types.ts'
import { ReactiveNode } from './ReactiveNode.ts'
import { insertNodeAfter } from './utils/insert-node-after.ts'
import { parseDynamicRawValue } from './utils/parse-dynamic-raw-value.ts'
import { renderContent } from './utils/render-content.ts'
import { val } from './helpers/index.ts'
import { setElementAttribute } from './utils/set-element-attribute.ts'
import { effect } from './state.ts'
import { DoubleLinkedList } from './DoubleLinkedList.ts'
import { turnCamelToKebabCasing } from './utils/turn-camel-to-kebab-casing.ts'
import { isObjectLiteral } from './utils/is-object-literal.ts'

// if its a known html event name the value will be null or a function
// otherwise undefined
const isKnownHTMLEventName = (name: string) =>
    typeof (document ?? {})[name as keyof Document] !== 'undefined'

const templateRegistry: Record<string, Template> = {}

interface AttributeSlot {
    type: 'attribute'
    name: string
    prop?: string
    value: unknown
    nodeSelector: string
    valueParts: Array<string | number>
}

interface ContentSlot {
    type: 'content'
    value: string
    nodeId: string
    valueParts: Array<string | number>
}

type TemplateSlot = AttributeSlot | ContentSlot

interface Template {
    template: DocumentFragment
    slots: DoubleLinkedList<TemplateSlot>
    nodeRefs: Record<string, Node>
}

// Use a monotonic counter for predictable, fast IDs
let idCounter = 0
const createId = () => (++idCounter).toString()

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

    // Build templateString efficiently
    let templateString = parts[0]
    for (let i = 1; i < parts.length; i++) {
        templateString += `$val${i - 1}` + parts[i]
    }
    templateString = templateString.trim()

    const slots = new DoubleLinkedList<TemplateSlot>()
    const nodeRefs: Record<string, Node> = {}

    const temp = parse(templateString, {
        createComment: (value) => document.createComment(value),
        createTextNode: (value) => document.createTextNode(value),
        createDocumentFragment: () => {
            const __self__ = document.createDocumentFragment()
            return {
                __self__,
                children: __self__.children,
                appendChild: (node: Node & { __self__?: Node }) => {
                    const slot = handleAppendChild(
                        node.__self__ ?? node,
                        __self__
                    )
                    if (slot) slots.push(slot)
                },
            } as unknown as DocumentFragmentLike
        },
        createElementNS: (namespaceURI: string, tagName: string) => {
            const id = createId()
            const __self__ = document.createElementNS(namespaceURI, tagName)
            const attrSlots: Record<string, AttributeSlot> = {}

            // Store reference for quick lookup
            nodeRefs[`[data-slot-id="${id}"]`] = __self__

            return {
                __self__,
                namespaceURI,
                tagName: __self__.tagName,
                children: __self__.children,
                attributes: __self__.attributes,
                appendChild(node: Node & { __self__?: Node }) {
                    const slot = handleAppendChild(
                        node.__self__ ?? node,
                        __self__
                    )
                    if (slot) slots.push(slot)
                },
                setAttribute(name: string, value: string) {
                    const dynamicValue = name.match(/^val([0-9]+)$/)
                    if (dynamicValue) {
                        const idx = Number(dynamicValue[1])
                        const attrs = values[idx]

                        if (isObjectLiteral(attrs)) {
                            let markSlot = false

                            for (const [key, v] of Object.entries(
                                attrs as Record<string, string>
                            )) {
                                const keyLower = key.toLowerCase()
                                const isRef = keyLower === 'ref'
                                const n =
                                    isRef || isKnownHTMLEventName(keyLower)
                                        ? keyLower
                                        : turnCamelToKebabCasing(key)

                                // only need slots for refs and function values
                                if (isRef || typeof v === 'function') {
                                    attrSlots[n] = {
                                        type: 'attribute',
                                        name: n,
                                        prop: key,
                                        value: isRef ? v : undefined,
                                        nodeSelector: `[data-slot-id="${id}"]`,
                                        valueParts: [idx],
                                    }
                                    slots.push(attrSlots[n])
                                    markSlot = true
                                } else {
                                    setElementAttribute(__self__, n, v)
                                }
                            }

                            if (markSlot) {
                                __self__.setAttribute('data-slot-id', id)
                            }

                            return
                        }

                        throw new Error(
                            `Invalid attribute object provided: ${attrs}`
                        )
                    }

                    const isRef = name === 'ref'

                    !isRef && slots.remove(attrSlots[name])

                    if (isRef || /\$val([0-9]+)/.test(value)) {
                        __self__.setAttribute('data-slot-id', id)
                        const v = value.trim()

                        attrSlots[name] = {
                            type: 'attribute',
                            name,
                            value: v,
                            nodeSelector: `[data-slot-id="${id}"]`,
                            valueParts: isRef ? [v] : parseDynamicRawValue(v),
                        }

                        return slots.push(attrSlots[name])
                    }

                    setElementAttribute(__self__, name, value)
                },
            } as unknown as ElementLike
        },
    })

    // Always clone the parsed template in #init, do not cache a pre-cloned fragment
    templateRegistry[tempId] = {
        // @ts-expect-error all elements have __self__
        template: temp.__self__ as DocumentFragment,
        slots,
        nodeRefs,
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
        isKnownHTMLEventName(name)
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
    cb: (item: EffectUnSubscriber) => void,
    onAttrUpdate: () => void
) {
    if (
        name.slice(0, 2) === 'on' &&
        handleElementEventListener(node, name, values)
    ) {
        node.removeAttribute(name)
        return
    }

    let init = false

    const setAttr = (prevValue?: unknown) => {
        const newValue =
            values.length === 1
                ? val(values[0])
                : values.map((d) => val(d)).join('')

        if (newValue !== prevValue) {
            setElementAttribute(node, name, newValue)
            init && onAttrUpdate()
        }

        init = true
        return newValue
    }

    if (values.some((d) => typeof d === 'function')) {
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
    #mountSub: LifecycleCallback | undefined
    #moveSub: LifecycleCallback | undefined
    #unmountSub: LifecycleCallback | undefined
    #updateSub: LifecycleCallback | undefined
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
        const refs = [
            ...Array.from(this.__CHILDREN__, (temp) => temp.refs),
            Object.entries(this.#refs).reduce(
                (acc, [key, set]) => ({
                    ...acc,
                    [key]: Array.from(set),
                }),
                {}
            ),
        ] as Array<Record<string, Array<Element>>>

        return refs.reduce(
            (acc, item) => {
                for (const [k, v] of Object.entries(item)) {
                    if (!acc[k]) {
                        acc[k] = []
                    }

                    acc[k] = Array.from(new Set([...acc[k], ...v]))
                }

                return acc
            },
            {} as Record<string, Element[]>
        )
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
    render(target: ShadowRoot | HTMLElement | Element | DocumentFragment) {
        if (
            target &&
            target !== this.parentNode &&
            (target instanceof ShadowRoot ||
                target instanceof Element ||
                target instanceof DocumentFragment)
        ) {
            if (this.mounted) {
                target.append(
                    this.#markers[0],
                    ...this.childNodes,
                    this.#markers[1]
                )
                if (!(target instanceof DocumentFragment)) {
                    this.#moveSub?.(this)
                }
            } else {
                this.#init('render', target)
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
                        this.#moveSub?.(this)
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
                        this.#moveSub?.(this)
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
            this.#unmountSub?.(this)
        }
    }

    onMount(cb: LifecycleCallback) {
        this.#mountSub = cb
        return this
    }

    onUpdate(cb: LifecycleCallback) {
        this.#updateSub = cb
        return this
    }

    onMove(cb: LifecycleCallback) {
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
            if (slot.type === 'attribute') {
                const node =
                    nodes[slot.nodeSelector] ??
                    frag.querySelector(slot.nodeSelector)

                if (node) {
                    nodes[slot.nodeSelector] = node
                    node.removeAttribute('data-slot-id')
                    const values = []

                    if (slot.name === 'ref') {
                        const name = String(slot.value)

                        if (!this.#refs[name]) {
                            this.#refs[name] = new Set()
                        }

                        this.#refs[name].add(node)
                        continue
                    }

                    for (const p of slot.valueParts) {
                        let value = typeof p === 'number' ? this.#values[p] : p

                        if (slot.prop && isObjectLiteral(value)) {
                            value = (value as ObjectLiteral<unknown>)[slot.prop]
                        }

                        values.push(value)
                    }

                    handleElementAttribute(
                        node,
                        slot.name,
                        values,
                        (item) => this.#effectUnsubs.add(item),
                        () => this.#updateSub?.(this)
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

                            rn.onUpdate(() => this.#updateSub?.(this))
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
        const res = this.#mountSub?.(this)

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
