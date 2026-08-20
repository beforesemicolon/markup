import { LifecycleCallback, ObjectLiteral } from './types.ts'
import { setElementAttribute } from './utils/set-element-attribute.ts'
import { isObjectLiteral } from './utils/is-object-literal.ts'
import { turnCamelToKebabCasing } from './utils/turn-camel-to-kebab-casing.ts'
import { insertNodeAfter } from './utils/insert-node-after.ts'

const PREFIX = '__BFS_V2_'
const TOKEN = /__BFS_V2_(\d+)__/g
const EXACT = /^__BFS_V2_(\d+)__$/
const SPREAD = /^__bfs_v2_(\d+)__$/
type Piece = string | number

type Descriptor =
    | { type: 'child'; node: number; value: number }
    | { type: 'attr'; node: number; name: string; pieces: Piece[] }
    | { type: 'event'; node: number; name: string; value: number }
    | { type: 'ref'; node: number; value: number }
    | { type: 'spread'; node: number; value: number }

type Definition = { template: HTMLTemplateElement; parts: Descriptor[] }
const registry = new WeakMap<TemplateStringsArray, Definition>()

const tagged = (parts: TemplateStringsArray | string[]): parts is TemplateStringsArray =>
    Object.prototype.hasOwnProperty.call(parts, 'raw')

const pieces = (value: string): Piece[] => {
    const out: Piece[] = []
    let last = 0
    TOKEN.lastIndex = 0
    for (let match = TOKEN.exec(value); match; match = TOKEN.exec(value)) {
        if (match.index > last) out.push(value.slice(last, match.index))
        out.push(Number(match[1]))
        last = match.index + match[0].length
    }
    if (last < value.length) out.push(value.slice(last))
    return out
}

const resolve = (value: unknown): unknown =>
    typeof value === 'function' ? resolve((value as () => unknown)()) : value

const attrValue = (parts: Piece[], values: unknown[]) => {
    if (parts.length === 1 && typeof parts[0] === 'number') {
        return resolve(values[parts[0]])
    }
    let out = ''
    for (const part of parts) {
        out += typeof part === 'number' ? String(resolve(values[part]) ?? '') : part
    }
    return out
}

function compile(parts: TemplateStringsArray | string[]): Definition {
    const key = tagged(parts) ? parts : null
    const cached = key ? registry.get(key) : undefined
    if (cached) return cached

    let source = parts[0] ?? ''
    for (let i = 1; i < parts.length; i++) source += `${PREFIX}${i - 1}__${parts[i]}`

    const template = document.createElement('template')
    template.innerHTML = source.trim()

    const dynamicText: Text[] = []
    const textWalker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT)
    while (textWalker.nextNode()) {
        const text = textWalker.currentNode as Text
        if (text.data.includes(PREFIX)) dynamicText.push(text)
    }
    for (const text of dynamicText) {
        const frag = document.createDocumentFragment()
        for (const part of pieces(text.data)) {
            frag.append(
                typeof part === 'number'
                    ? document.createComment(`bfs:${part}`)
                    : document.createTextNode(part)
            )
        }
        text.replaceWith(frag)
    }

    const out: Descriptor[] = []
    const walker = document.createTreeWalker(
        template.content,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT
    )
    let index = -1
    while (walker.nextNode()) {
        index++
        const node = walker.currentNode
        if (node instanceof Comment && node.data.startsWith('bfs:')) {
            out.push({ type: 'child', node: index, value: Number(node.data.slice(4)) })
            continue
        }
        if (!(node instanceof Element)) continue
        for (const attr of Array.from(node.attributes)) {
            const spread = SPREAD.exec(attr.name)
            if (spread) {
                out.push({ type: 'spread', node: index, value: Number(spread[1]) })
                node.removeAttribute(attr.name)
                continue
            }
            if (!attr.value.includes(PREFIX)) continue
            const exact = EXACT.exec(attr.value)
            const valueIndex = exact ? Number(exact[1]) : null
            const name = attr.name.toLowerCase()
            if (name === 'ref' && valueIndex !== null) {
                out.push({ type: 'ref', node: index, value: valueIndex })
            } else if (name.startsWith('on') && valueIndex !== null) {
                out.push({ type: 'event', node: index, name: name.slice(2), value: valueIndex })
            } else {
                out.push({ type: 'attr', node: index, name: attr.name, pieces: pieces(attr.value) })
            }
            node.removeAttribute(attr.name)
        }
    }
    const definition = { template, parts: out }
    if (key) registry.set(key, definition)
    return definition
}

type Item = Node | HtmlTemplate

type Runtime =
    | { type: 'child'; anchor: Comment; value: number; current: unknown; items: Item[] }
    | { type: 'attr'; node: Element; name: string; pieces: Piece[]; current: unknown }
    | { type: 'event'; node: Element; name: string; value: number; fn?: EventListener; options?: boolean | AddEventListenerOptions }
    | { type: 'ref'; node: Element; value: number; name?: string }
    | { type: 'spread'; node: Element; value: number; current: Map<string, unknown>; events: Map<string, { fn: EventListener; options?: boolean | AddEventListenerOptions }> }

const eventValue = (raw: unknown) => {
    let fn: unknown = raw
    let options: boolean | AddEventListenerOptions | undefined
    if (Array.isArray(raw)) [fn, options] = raw
    if (typeof fn !== 'function') throw new Error(`Handler is not a function. Found "${fn}".`)
    return { fn: fn as EventListener, options }
}

const spreadName = (name: string) => {
    const lower = name.toLowerCase()
    return lower === 'ref' || lower.startsWith('on') ? lower : turnCamelToKebabCasing(name)
}

export class HtmlTemplate {
    #definition: Definition
    #parts: TemplateStringsArray | string[]
    #values: unknown[]
    #runtime: Runtime[] = []
    #markers = [document.createTextNode(''), document.createTextNode('')]
    #refs: Record<string, Set<Element>> = {}
    #mounted = false
    #mountSub?: LifecycleCallback
    #moveSub?: LifecycleCallback
    #updateSub?: LifecycleCallback
    #unmountSub?: LifecycleCallback
    __PARENT__: HtmlTemplate | null = null
    __CHILDREN__: Set<HtmlTemplate> = new Set()

    constructor(parts: TemplateStringsArray | string[], values: unknown[]) {
        this.#parts = parts
        this.#values = values
        this.#definition = compile(parts)
    }

    get mounted() { return this.#mounted }
    get parentNode(): ParentNode | null { return this.#markers[0].parentNode }
    get __MARKERS__() { return this.#markers }
    get childNodes() {
        const out: Node[] = []
        let node = this.#markers[0].nextSibling
        while (node && node !== this.#markers[1]) { out.push(node); node = node.nextSibling }
        return out
    }
    get refs(): Record<string, Element[]> {
        const all: Record<string, Set<Element>> = {}
        const add = (refs: Record<string, Iterable<Element>>) => {
            for (const [name, nodes] of Object.entries(refs)) {
                const set = all[name] ?? (all[name] = new Set())
                for (const node of nodes) set.add(node)
            }
        }
        add(this.#refs)
        for (const child of this.__CHILDREN__) add(child.refs)
        return Object.fromEntries(Object.entries(all).map(([name, nodes]) => [name, [...nodes]]))
    }

    __addRef(name: string, node: Element) { (this.#refs[name] ??= new Set()).add(node) }
    __removeRef(name: string, node: Element) {
        this.#refs[name]?.delete(node)
        if (!this.#refs[name]?.size) delete this.#refs[name]
    }

    #clearChild(part: Extract<Runtime, { type: 'child' }>) {
        for (const item of part.items) item instanceof HtmlTemplate ? item.unmount() : item.remove()
        part.items = []
    }

    #appendChild(part: Extract<Runtime, { type: 'child' }>, value: unknown) {
        const parent = part.anchor.parentNode
        if (!parent) return
        const resolved = resolve(value)
        const values = Array.isArray(resolved) ? resolved : [resolved]
        for (const entry of values) {
            const item = resolve(entry)
            if (item instanceof HtmlTemplate) {
                item.__PARENT__ = this
                this.__CHILDREN__.add(item)
                const frag = document.createDocumentFragment()
                item.render(frag)
                parent.insertBefore(frag, part.anchor)
                part.items.push(item)
            } else if (item instanceof Node) {
                parent.insertBefore(item, part.anchor)
                part.items.push(item)
            } else {
                const text = document.createTextNode(String(item))
                parent.insertBefore(text, part.anchor)
                part.items.push(text)
            }
        }
    }

    #commit(part: Runtime, values: unknown[]) {
        if (part.type === 'child') {
            const next = resolve(values[part.value])
            if (Object.is(next, part.current)) return false
            if (
                next instanceof HtmlTemplate &&
                part.items.length === 1 &&
                part.items[0] instanceof HtmlTemplate &&
                part.items[0].__updateFrom(next)
            ) {
                part.current = next
                return true
            }
            if (!Array.isArray(next) && !(next instanceof Node) && !(next instanceof HtmlTemplate) && part.items.length === 1 && part.items[0] instanceof Text) {
                part.items[0].data = String(next)
                part.current = next
                return true
            }
            this.#clearChild(part)
            this.#appendChild(part, next)
            part.current = next
            return true
        }
        if (part.type === 'attr') {
            const next = attrValue(part.pieces, values)
            if (Object.is(next, part.current)) return false
            setElementAttribute(part.node, part.name, next)
            part.current = next
            return true
        }
        if (part.type === 'event') {
            const next = eventValue(values[part.value])
            if (next.fn === part.fn && next.options === part.options) return false
            if (part.fn) part.node.removeEventListener(part.name, part.fn, part.options)
            part.node.addEventListener(part.name, next.fn, next.options)
            part.fn = next.fn
            part.options = next.options
            return true
        }
        if (part.type === 'ref') {
            const next = String(resolve(values[part.value]))
            if (next === part.name) return false
            if (part.name) this.__removeRef(part.name, part.node)
            this.__addRef(next, part.node)
            part.name = next
            return true
        }

        const source = resolve(values[part.value])
        if (!isObjectLiteral(source)) throw new Error(`Invalid attribute object provided: ${source}`)
        const next = new Map(Object.entries(source as ObjectLiteral<unknown>))
        for (const [key, old] of part.current) {
            if (next.has(key)) continue
            const name = spreadName(key)
            if (name === 'ref') this.__removeRef(String(old), part.node)
            else if (name.startsWith('on')) {
                const e = part.events.get(key)
                if (e) part.node.removeEventListener(name.slice(2), e.fn, e.options)
                part.events.delete(key)
            } else setElementAttribute(part.node, name, undefined)
        }
        let changed = false
        for (const [key, value] of next) {
            if (Object.is(part.current.get(key), value)) continue
            const name = spreadName(key)
            if (name === 'ref') {
                const old = part.current.get(key)
                if (old !== undefined) this.__removeRef(String(old), part.node)
                this.__addRef(String(value), part.node)
            } else if (name.startsWith('on')) {
                const old = part.events.get(key)
                if (old) part.node.removeEventListener(name.slice(2), old.fn, old.options)
                const e = eventValue(value)
                part.node.addEventListener(name.slice(2), e.fn, e.options)
                part.events.set(key, e)
            } else setElementAttribute(part.node, name, value)
            changed = true
        }
        part.current = next
        return changed
    }

    __updateFrom(next: HtmlTemplate) {
        if (!this.#mounted || next.#mounted || this.#parts !== next.#parts) return false
        this.#values = next.#values
        let changed = false
        for (const part of this.#runtime) changed = this.#commit(part, this.#values) || changed
        if (changed) this.#updateSub?.(this)
        return true
    }

    #mount(action: 'render' | 'replace' | 'after', target: Node) {
        const frag = this.#definition.template.content.cloneNode(true) as DocumentFragment
        const nodes: Node[] = []
        const walker = document.createTreeWalker(frag, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) nodes.push(walker.currentNode)
        this.#runtime = []
        for (const d of this.#definition.parts) {
            const node = nodes[d.node]
            let part: Runtime
            if (d.type === 'child') part = { type: 'child', anchor: node as Comment, value: d.value, current: Symbol(), items: [] }
            else if (d.type === 'attr') part = { type: 'attr', node: node as Element, name: d.name, pieces: d.pieces, current: Symbol() }
            else if (d.type === 'event') part = { type: 'event', node: node as Element, name: d.name, value: d.value }
            else if (d.type === 'ref') part = { type: 'ref', node: node as Element, value: d.value }
            else part = { type: 'spread', node: node as Element, value: d.value, current: new Map(), events: new Map() }
            this.#runtime.push(part)
            this.#commit(part, this.#values)
        }
        frag.prepend(this.#markers[0]); frag.append(this.#markers[1])
        if (action === 'replace') target.parentNode?.replaceChild(frag, target)
        else if (action === 'after') insertNodeAfter(frag, target)
        else target.appendChild(frag)
        this.#mounted = true
        const cleanup = this.#mountSub?.(this)
        if (typeof cleanup === 'function') this.#unmountSub = cleanup
    }

    render(target: ShadowRoot | HTMLElement | Element | DocumentFragment) {
        if (!(target instanceof ShadowRoot || target instanceof Element || target instanceof DocumentFragment)) return this
        if (this.#mounted) {
            if (target !== this.parentNode) {
                target.append(this.#markers[0], ...this.childNodes, this.#markers[1])
                if (!(target instanceof DocumentFragment)) this.#moveSub?.(this)
            }
        } else this.#mount('render', target)
        return this
    }

    replace(target: Node | HtmlTemplate) {
        if (target instanceof ShadowRoot || target instanceof HTMLBodyElement || target instanceof HTMLHeadElement || target instanceof HTMLHtmlElement)
            throw new Error(`Invalid "replace" target element. Received ${target}`)
        let node: Node = target as Node
        if (target instanceof HtmlTemplate) {
            node = document.createTextNode('')
            target.__MARKERS__[0].parentNode?.insertBefore(node, target.__MARKERS__[0])
            this.__PARENT__ = target.__PARENT__
            target.unmount()
        }
        if (!node.parentNode) return this
        if (this.#mounted) {
            const frag = document.createDocumentFragment()
            frag.append(this.#markers[0], ...this.childNodes, this.#markers[1])
            node.parentNode.replaceChild(frag, node)
            this.#moveSub?.(this)
        } else this.#mount('replace', node)
        return this
    }

    insertAfter(target: Node | HtmlTemplate) {
        if (target instanceof ShadowRoot || target instanceof HTMLBodyElement || target instanceof HTMLHeadElement || target instanceof HTMLHtmlElement)
            throw new Error(`Invalid "insertAfter" target element. Received ${target}`)
        const node = target instanceof HtmlTemplate ? target.__MARKERS__[1] : target
        if (this.#mounted) {
            if (node.nextSibling !== this.#markers[0]) {
                const frag = document.createDocumentFragment()
                frag.append(this.#markers[0], ...this.childNodes, this.#markers[1])
                insertNodeAfter(frag, node)
                this.#moveSub?.(this)
            }
        } else this.#mount('after', node)
        if (target instanceof HtmlTemplate) {
            this.__PARENT__ = target.__PARENT__
            this.__PARENT__?.__CHILDREN__.add(this)
        }
        return this
    }

    unmount() {
        if (!this.#mounted) return this
        for (const part of this.#runtime) {
            if (part.type === 'child') this.#clearChild(part)
            else if (part.type === 'event' && part.fn) part.node.removeEventListener(part.name, part.fn, part.options)
            else if (part.type === 'ref' && part.name) this.__removeRef(part.name, part.node)
            else if (part.type === 'spread') {
                for (const [key, value] of part.current) if (spreadName(key) === 'ref') this.__removeRef(String(value), part.node)
                for (const [key, e] of part.events) part.node.removeEventListener(spreadName(key).slice(2), e.fn, e.options)
            }
        }
        let node: Node | null = this.#markers[0]
        while (node) { const next = node.nextSibling; node.remove(); if (node === this.#markers[1]) break; node = next }
        this.__PARENT__?.__CHILDREN__.delete(this)
        this.__PARENT__ = null; this.__CHILDREN__.clear(); this.#runtime = []; this.#refs = {}; this.#mounted = false
        this.#unmountSub?.(this)
        return this
    }

    onMount(cb: LifecycleCallback) { this.#mountSub = cb; return this }
    onUpdate(cb: LifecycleCallback) { this.#updateSub = cb; return this }
    onMove(cb: LifecycleCallback) { this.#moveSub = cb; return this }

    toString() {
        if (this.#mounted) return this.childNodes.map(node => node instanceof Element ? node.outerHTML : node.nodeValue).join('')
        const host = document.createElement('div'); this.render(host)
        const out = this.childNodes.map(node => node instanceof Element ? node.outerHTML : node.nodeValue).join('')
        this.unmount(); return out
    }
}

export const html = (parts: TemplateStringsArray | string[], ...values: unknown[]) =>
    new HtmlTemplate(parts, values)
