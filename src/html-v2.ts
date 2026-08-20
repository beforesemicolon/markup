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
    | { type: 'raw'; node: number; pieces: Piece[] }
    | { type: 'attr'; node: number; name: string; pieces: Piece[] }
    | { type: 'event'; node: number; name: string; value: number }
    | { type: 'ref'; node: number; name?: string; value?: number }
    | { type: 'spread'; node: number; value: number; blocked: string[] }

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
    return out.trim()
}

const spreadName = (name: string) => {
    const lower = name.toLowerCase()
    return lower === 'ref' || lower.startsWith('on')
        ? lower
        : turnCamelToKebabCasing(name)
}

const isKnownHTMLEventName = (name: string) =>
    typeof (document ?? {})[name as keyof Document] !== 'undefined'

const shouldUseEventListener = (node: Element, name: string) => {
    const ctor = node.nodeName.includes('-')
        ? customElements.get(node.localName) ?? node.constructor
        : node.constructor

    return (
        (node.nodeName.includes('-') &&
            // @ts-expect-error observedAttributes exists on custom element constructors
            !ctor?.observedAttributes?.includes(name)) ||
        isKnownHTMLEventName(name)
    )
}

function compile(parts: TemplateStringsArray | string[]): Definition {
    const key = tagged(parts) ? parts : null
    const cached = key ? registry.get(key) : undefined
    if (cached) return cached

    let source = parts[0] ?? ''
    for (let i = 1; i < parts.length; i++) {
        source += `${PREFIX}${i - 1}__${parts[i]}`
    }

    // A dynamic tag name is content, never structure. Escape the opening '<'
    // before parsing so the browser cannot turn the marker into an element.
    source = source
        .replace(/<(__BFS_V2_\d+__)/g, '&lt;$1')
        .replace(/<\/(__BFS_V2_\d+__)/g, '&lt;/$1')

    const template = document.createElement('template')
    template.innerHTML = source.trim()

    const dynamicText: Text[] = []
    const textWalker = document.createTreeWalker(
        template.content,
        NodeFilter.SHOW_TEXT
    )
    while (textWalker.nextNode()) {
        const text = textWalker.currentNode as Text
        if (text.data.includes(PREFIX)) dynamicText.push(text)
    }

    for (const text of dynamicText) {
        // Script/style are raw-text elements. Keep their Text node intact and
        // compile the interpolation into a dedicated raw-text part below.
        if (text.parentElement?.matches('script,style')) continue

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
            out.push({
                type: 'child',
                node: index,
                value: Number(node.data.slice(4)),
            })
            continue
        }

        if (node instanceof Text && node.data.includes(PREFIX)) {
            out.push({ type: 'raw', node: index, pieces: pieces(node.data) })
            node.data = ''
            continue
        }

        if (!(node instanceof Element)) continue

        const attrs = Array.from(node.attributes)
        const blocked = attrs
            .filter((attr) => !SPREAD.test(attr.name))
            .map((attr) => attr.name.toLowerCase())

        for (const attr of attrs) {
            const spread = SPREAD.exec(attr.name)
            if (spread) {
                out.push({
                    type: 'spread',
                    node: index,
                    value: Number(spread[1]),
                    blocked,
                })
                node.removeAttribute(attr.name)
                continue
            }

            const name = attr.name.toLowerCase()
            if (name === 'ref') {
                const exact = EXACT.exec(attr.value)
                out.push(
                    exact
                        ? {
                              type: 'ref',
                              node: index,
                              value: Number(exact[1]),
                          }
                        : { type: 'ref', node: index, name: attr.value }
                )
                node.removeAttribute(attr.name)
                continue
            }

            if (!attr.value.includes(PREFIX)) {
                // Normalize static attributes through the same DOM/property
                // semantics as dynamic attributes (notably boolean attrs).
                setElementAttribute(node, attr.name, attr.value)
                continue
            }

            const exact = EXACT.exec(attr.value)
            const valueIndex = exact ? Number(exact[1]) : null

            if (name.startsWith('on') && valueIndex !== null) {
                out.push({
                    type: 'event',
                    node: index,
                    name,
                    value: valueIndex,
                })
            } else {
                out.push({
                    type: 'attr',
                    node: index,
                    name: attr.name,
                    pieces: pieces(attr.value),
                })
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
    | {
          type: 'child'
          anchor: Text
          value: number
          current: unknown
          items: Item[]
      }
    | {
          type: 'raw'
          node: Text
          pieces: Piece[]
          current: string
      }
    | {
          type: 'attr'
          node: Element
          name: string
          pieces: Piece[]
          current: unknown
      }
    | {
          type: 'event'
          node: Element
          name: string
          value: number
          fn?: EventListener
          options?: boolean | AddEventListenerOptions
          asProperty?: boolean
          current?: unknown
      }
    | {
          type: 'ref'
          node: Element
          value?: number
          staticName?: string
          name?: string
      }
    | {
          type: 'spread'
          node: Element
          value: number
          blocked: Set<string>
          current: Map<string, unknown>
          events: Map<
              string,
              {
                  fn: EventListener
                  options?: boolean | AddEventListenerOptions
              }
          >
      }

const eventValue = (raw: unknown, name: string) => {
    let fn: unknown = raw
    let options: boolean | AddEventListenerOptions | undefined
    if (Array.isArray(raw)) [fn, options] = raw
    if (typeof fn !== 'function') {
        throw new Error(
            `Handler for event "${name}" is not a function. Found "${fn}".`
        )
    }
    return { fn: fn as EventListener, options }
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

        for (const descriptor of this.#definition.parts) {
            if (descriptor.type === 'spread') {
                const value = resolve(values[descriptor.value])
                if (!isObjectLiteral(value)) {
                    throw new Error(`Invalid attribute object provided: ${value}`)
                }
            }
        }
    }

    get mounted() {
        return this.#mounted
    }

    get parentNode(): ParentNode | null {
        return this.#markers[0].parentNode
    }

    get __MARKERS__() {
        return this.#markers
    }

    get childNodes() {
        const out: Node[] = []
        let node = this.#markers[0].nextSibling
        while (node && node !== this.#markers[1]) {
            out.push(node)
            node = node.nextSibling
        }
        return out
    }

    get refs(): Record<string, Element[]> {
        const all: Record<string, Set<Element>> = {}
        const add = (refs: Record<string, Iterable<Element>>) => {
            for (const [name, nodes] of Object.entries(refs)) {
                const target = all[name] ?? (all[name] = new Set())
                for (const node of nodes) target.add(node)
            }
        }
        add(this.#refs)
        for (const child of this.__CHILDREN__) add(child.refs)
        return Object.fromEntries(
            Object.entries(all).map(([name, nodes]) => [name, [...nodes]])
        )
    }

    __addRef(name: string, node: Element) {
        if (!name) return
        ;(this.#refs[name] ??= new Set()).add(node)
    }

    __removeRef(name: string, node: Element) {
        this.#refs[name]?.delete(node)
        if (!this.#refs[name]?.size) delete this.#refs[name]
    }

    #clearChild(part: Extract<Runtime, { type: 'child' }>) {
        for (const item of part.items) {
            if (item instanceof HtmlTemplate) {
                item.unmount()
            } else {
                item.parentNode?.removeChild(item)
            }
        }
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
        if (part.type === 'raw') {
            let next = ''
            for (const piece of part.pieces) {
                next +=
                    typeof piece === 'number'
                        ? String(resolve(values[piece]) ?? '')
                        : piece
            }
            if (next === part.current) return false
            part.node.data = next
            part.current = next
            return true
        }

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

            if (
                !Array.isArray(next) &&
                !(next instanceof Node) &&
                !(next instanceof HtmlTemplate) &&
                part.items.length === 1 &&
                part.items[0] instanceof Text
            ) {
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
            const raw = values[part.value]
            if (part.asProperty) {
                const next = resolve(raw)
                if (Object.is(next, part.current)) return false
                setElementAttribute(part.node, part.name, next)
                part.current = next
                return true
            }

            const next = eventValue(raw, part.name)
            const eventName = part.name.slice(2)
            if (next.fn === part.fn && next.options === part.options) return false
            if (part.fn) {
                part.node.removeEventListener(eventName, part.fn, part.options)
            }
            part.node.addEventListener(eventName, next.fn, next.options)
            part.fn = next.fn
            part.options = next.options
            return true
        }

        if (part.type === 'ref') {
            const next = part.staticName ?? String(resolve(values[part.value!]) ?? '')
            if (next === part.name) return false
            if (part.name) this.__removeRef(part.name, part.node)
            this.__addRef(next, part.node)
            part.name = next
            return true
        }

        const source = resolve(values[part.value])
        if (!isObjectLiteral(source)) {
            throw new Error(`Invalid attribute object provided: ${source}`)
        }

        const next = new Map(Object.entries(source as ObjectLiteral<unknown>))

        for (const [key, old] of part.current) {
            const name = spreadName(key)
            if (part.blocked.has(name) || next.has(key)) continue
            if (name === 'ref') {
                this.__removeRef(String(old), part.node)
            } else if (name.startsWith('on')) {
                const event = part.events.get(key)
                if (event) {
                    part.node.removeEventListener(
                        name.slice(2),
                        event.fn,
                        event.options
                    )
                }
                part.events.delete(key)
            } else {
                setElementAttribute(part.node, name, undefined)
            }
        }

        let changed = false
        for (const [key, value] of next) {
            const name = spreadName(key)
            if (part.blocked.has(name)) continue
            if (Object.is(part.current.get(key), value)) continue

            if (name === 'ref') {
                const old = part.current.get(key)
                if (old !== undefined) this.__removeRef(String(old), part.node)
                this.__addRef(String(resolve(value) ?? ''), part.node)
            } else if (name.startsWith('on') && shouldUseEventListener(part.node, name)) {
                const old = part.events.get(key)
                if (old) {
                    part.node.removeEventListener(name.slice(2), old.fn, old.options)
                }
                const event = eventValue(value, name)
                part.node.addEventListener(name.slice(2), event.fn, event.options)
                part.events.set(key, event)
            } else {
                setElementAttribute(part.node, name, resolve(value))
            }
            changed = true
        }

        part.current = next
        return changed
    }

    __updateFrom(next: HtmlTemplate) {
        if (!this.#mounted || next.#mounted || this.#parts !== next.#parts) {
            return false
        }

        this.#values = next.#values
        let changed = false
        for (const part of this.#runtime) {
            changed = this.#commit(part, this.#values) || changed
        }
        if (changed) this.#updateSub?.(this)
        return true
    }

    #mount(action: 'render' | 'replace' | 'after', target: Node) {
        const frag = this.#definition.template.content.cloneNode(
            true
        ) as DocumentFragment
        const nodes: Node[] = []
        const walker = document.createTreeWalker(
            frag,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT
        )
        while (walker.nextNode()) nodes.push(walker.currentNode)

        this.#runtime = []

        for (const descriptor of this.#definition.parts) {
            const compiledNode = nodes[descriptor.node]
            let part: Runtime

            if (descriptor.type === 'child') {
                const anchor = document.createTextNode('')
                compiledNode.parentNode?.replaceChild(anchor, compiledNode)
                part = {
                    type: 'child',
                    anchor,
                    value: descriptor.value,
                    current: Symbol(),
                    items: [],
                }
            } else if (descriptor.type === 'raw') {
                part = {
                    type: 'raw',
                    node: compiledNode as Text,
                    pieces: descriptor.pieces,
                    current: '',
                }
            } else if (descriptor.type === 'attr') {
                part = {
                    type: 'attr',
                    node: compiledNode as Element,
                    name: descriptor.name,
                    pieces: descriptor.pieces,
                    current: Symbol(),
                }
            } else if (descriptor.type === 'event') {
                const node = compiledNode as Element
                part = {
                    type: 'event',
                    node,
                    name: descriptor.name,
                    value: descriptor.value,
                    asProperty: !shouldUseEventListener(node, descriptor.name),
                }
            } else if (descriptor.type === 'ref') {
                part = {
                    type: 'ref',
                    node: compiledNode as Element,
                    value: descriptor.value,
                    staticName: descriptor.name,
                }
            } else {
                part = {
                    type: 'spread',
                    node: compiledNode as Element,
                    value: descriptor.value,
                    blocked: new Set(descriptor.blocked),
                    current: new Map(),
                    events: new Map(),
                }
            }

            this.#runtime.push(part)
        }

        frag.prepend(this.#markers[0])
        frag.append(this.#markers[1])

        if (action === 'replace') {
            target.parentNode?.replaceChild(frag, target)
        } else if (action === 'after') {
            insertNodeAfter(frag, target)
        } else {
            target.appendChild(frag)
        }

        this.#mounted = true

        // Commit after insertion. Custom elements are upgraded/connected at this
        // point, so property setters are available for object/function values.
        for (const part of this.#runtime) {
            this.#commit(part, this.#values)
        }

        const cleanup = this.#mountSub?.(this)
        if (typeof cleanup === 'function') this.#unmountSub = cleanup
    }

    render(target: ShadowRoot | HTMLElement | Element | DocumentFragment) {
        if (
            !(
                target instanceof ShadowRoot ||
                target instanceof Element ||
                target instanceof DocumentFragment
            )
        ) {
            return this
        }

        if (this.#mounted) {
            if (target !== this.parentNode) {
                target.append(
                    this.#markers[0],
                    ...this.childNodes,
                    this.#markers[1]
                )
                if (!(target instanceof DocumentFragment)) this.#moveSub?.(this)
            }
        } else {
            this.#mount('render', target)
        }
        return this
    }

    replace(target: Node | HtmlTemplate) {
        if (
            target instanceof ShadowRoot ||
            target instanceof HTMLBodyElement ||
            target instanceof HTMLHeadElement ||
            target instanceof HTMLHtmlElement
        ) {
            throw new Error(`Invalid "replace" target element. Received ${target}`)
        }

        let node: Node = target as Node
        if (target instanceof HtmlTemplate) {
            node = document.createTextNode('')
            target.__MARKERS__[0].parentNode?.insertBefore(
                node,
                target.__MARKERS__[0]
            )
            this.__PARENT__ = target.__PARENT__
            target.unmount()
        }

        if (!node.parentNode) return this

        if (this.#mounted) {
            const frag = document.createDocumentFragment()
            frag.append(
                this.#markers[0],
                ...this.childNodes,
                this.#markers[1]
            )
            node.parentNode.replaceChild(frag, node)
            this.#moveSub?.(this)
        } else {
            this.#mount('replace', node)
        }
        return this
    }

    insertAfter(target: Node | HtmlTemplate) {
        if (
            target instanceof ShadowRoot ||
            target instanceof HTMLBodyElement ||
            target instanceof HTMLHeadElement ||
            target instanceof HTMLHtmlElement
        ) {
            throw new Error(
                `Invalid "insertAfter" target element. Received ${target}`
            )
        }

        const node =
            target instanceof HtmlTemplate ? target.__MARKERS__[1] : target

        if (this.#mounted) {
            if (node.nextSibling !== this.#markers[0]) {
                const frag = document.createDocumentFragment()
                frag.append(
                    this.#markers[0],
                    ...this.childNodes,
                    this.#markers[1]
                )
                insertNodeAfter(frag, node)
                this.#moveSub?.(this)
            }
        } else {
            this.#mount('after', node)
        }

        if (target instanceof HtmlTemplate) {
            this.__PARENT__ = target.__PARENT__
            this.__PARENT__?.__CHILDREN__.add(this)
        }
        return this
    }

    unmount() {
        if (!this.#mounted) return this

        for (const part of this.#runtime) {
            if (part.type === 'child') {
                this.#clearChild(part)
            } else if (part.type === 'event' && part.fn) {
                part.node.removeEventListener(
                    part.name.slice(2),
                    part.fn,
                    part.options
                )
            } else if (part.type === 'ref' && part.name) {
                this.__removeRef(part.name, part.node)
            } else if (part.type === 'spread') {
                for (const [key, value] of part.current) {
                    if (spreadName(key) === 'ref') {
                        this.__removeRef(String(value), part.node)
                    }
                }
                for (const [key, event] of part.events) {
                    part.node.removeEventListener(
                        spreadName(key).slice(2),
                        event.fn,
                        event.options
                    )
                }
            }
        }

        let node: Node | null = this.#markers[0]
        while (node) {
            const next: Node | null = node.nextSibling
            node.parentNode?.removeChild(node)
            if (node === this.#markers[1]) break
            node = next
        }

        this.__PARENT__?.__CHILDREN__.delete(this)
        this.__PARENT__ = null
        this.__CHILDREN__.clear()
        this.#runtime = []
        this.#refs = {}
        this.#mounted = false
        this.#unmountSub?.(this)
        return this
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
        if (this.#mounted) {
            return this.childNodes
                .map((node) =>
                    node instanceof Element ? node.outerHTML : node.nodeValue
                )
                .join('')
        }

        const host = document.createElement('div')
        this.render(host)
        const out = this.childNodes
            .map((node) =>
                node instanceof Element ? node.outerHTML : node.nodeValue
            )
            .join('')
        this.unmount()
        return out
    }
}

export const html = (
    parts: TemplateStringsArray | string[],
    ...values: unknown[]
) => new HtmlTemplate(parts, values)
