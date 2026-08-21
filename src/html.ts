import { EffectUnSubscriber, ObjectLiteral } from './types.ts'
import { setElementAttribute } from './utils/set-element-attribute.ts'
import { isObjectLiteral } from './utils/is-object-literal.ts'
import { turnCamelToKebabCasing } from './utils/turn-camel-to-kebab-casing.ts'
import { insertNodeAfter } from './utils/insert-node-after.ts'
import { DoubleLinkedList } from './DoubleLinkedList.ts'
import { effect } from './state.ts'

const PREFIX = '__BFS_V2_'
const TOKEN = /__BFS_V2_(\d+)__/g
const EXACT = /^__BFS_V2_(\d+)__$/
const SPREAD = /^__bfs_v2_(\d+)__$/

type Piece = string | number
type LifecycleCallback = (template: HtmlTemplate) => void | (() => void)

type Descriptor =
    | { type: 'child'; node: number; value: number }
    | { type: 'raw'; node: number; pieces: Piece[] }
    | { type: 'attr'; node: number; name: string; pieces: Piece[] }
    | { type: 'event'; node: number; name: string; value: number }
    | { type: 'ref'; node: number; name?: string; value?: number }
    | { type: 'spread'; node: number; value: number; blocked: string[] }

type Definition = {
    template: HTMLTemplateElement
    parts: Descriptor[]
    hasCustomElements: boolean
}

const registry = new WeakMap<TemplateStringsArray, Definition>()

const isTemplateStringsArray = (
    parts: TemplateStringsArray | string[]
): parts is TemplateStringsArray =>
    Object.prototype.hasOwnProperty.call(parts, 'raw')

const parsePieces = (value: string): Piece[] => {
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

const isRebindableValue = (value: unknown) =>
    value === null ||
    value === undefined ||
    (typeof value !== 'object' && typeof value !== 'function')

const getAttributeValue = (parts: Piece[], values: unknown[]) => {
    if (parts.length === 1 && typeof parts[0] === 'number') {
        return resolve(values[parts[0]])
    }

    let out = ''
    for (const part of parts) {
        out +=
            typeof part === 'number'
                ? String(resolve(values[part]) ?? '')
                : part
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
            // @ts-expect-error observedAttributes is a custom-element constructor property
            !ctor?.observedAttributes?.includes(name)) ||
        isKnownHTMLEventName(name)
    )
}

const setDynamicValue = (node: Element, name: string, value: unknown) => {
    setElementAttribute(node, name, value)
}

const extractTableContext = (
    template: HTMLTemplateElement,
    selector: string
) => {
    const context = template.content.querySelector(selector)
    if (!context) return

    const extracted = document.createDocumentFragment()
    while (context.firstChild) extracted.appendChild(context.firstChild)
    template.content.replaceChildren(extracted)
}

const parseTemplateSource = (template: HTMLTemplateElement, source: string) => {
    const tableRoot = /^<(tr|td|th|tbody|thead|tfoot|colgroup|caption|col)\b/i
        .exec(source)?.[1]
        ?.toLowerCase()

    if (!tableRoot) {
        template.innerHTML = source
        return
    }

    // The existing Markup parser permits text directly inside <tr>. Native HTML
    // parsing foster-parents that text outside the row. Parse it temporarily in a
    // cell, then unwrap the cell so the resulting DOM matches existing behavior.
    if (tableRoot === 'tr') {
        const row = /^<tr([^>]*)>([\s\S]*)<\/tr>$/i.exec(source)
        if (row && !/<(?:td|th)\b/i.test(row[2])) {
            template.innerHTML = `<table><tbody><tr${row[1]}><td data-bfs-row-content>${row[2]}</td></tr></tbody></table>`
            const tbody = template.content.querySelector('tbody')
            const tr = tbody?.querySelector('tr')
            const content = tr?.querySelector('[data-bfs-row-content]')

            if (tr && content) {
                while (content.firstChild) {
                    tr.insertBefore(content.firstChild, content)
                }
                content.remove()
            }

            extractTableContext(template, 'tbody')
            return
        }
    }

    const contexts: Record<string, [string, string, string]> = {
        tr: ['<table><tbody>', '</tbody></table>', 'tbody'],
        td: ['<table><tbody><tr>', '</tr></tbody></table>', 'tr'],
        th: ['<table><tbody><tr>', '</tr></tbody></table>', 'tr'],
        tbody: ['<table>', '</table>', 'table'],
        thead: ['<table>', '</table>', 'table'],
        tfoot: ['<table>', '</table>', 'table'],
        colgroup: ['<table>', '</table>', 'table'],
        caption: ['<table>', '</table>', 'table'],
        col: ['<table><colgroup>', '</colgroup></table>', 'colgroup'],
    }
    const [before, after, selector] = contexts[tableRoot]
    template.innerHTML = `${before}${source}${after}`
    extractTableContext(template, selector)
}

function compile(parts: TemplateStringsArray | string[]): Definition {
    const key = isTemplateStringsArray(parts) ? parts : null
    const cached = key ? registry.get(key) : undefined
    if (cached) return cached

    let source = parts[0] ?? ''
    for (let index = 1; index < parts.length; index++) {
        source += `${PREFIX}${index - 1}__${parts[index]}`
    }

    source = source
        .replace(/<(__BFS_V2_\d+__)/g, '&lt;$1')
        .replace(/<\/(__BFS_V2_\d+__)/g, '&lt;/$1')
        .replace(
            />(\s*)__BFS_V2_(\d+)__(\s*)</g,
            '>$1<!--bfs:$2-->$3<'
        )
        .replace(
            /<([a-z][\w.-]*-[\w.-]+)([^>]*)\/>/gi,
            '<$1$2></$1>'
        )

    const template = document.createElement('template')
    parseTemplateSource(template, source.trim())

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
        if (text.parentElement?.matches('script,style')) continue

        const fragment = document.createDocumentFragment()
        for (const part of parsePieces(text.data)) {
            fragment.append(
                typeof part === 'number'
                    ? document.createComment(`bfs:${part}`)
                    : document.createTextNode(part)
            )
        }
        text.replaceWith(fragment)
    }

    const descriptors: Descriptor[] = []
    const walker = document.createTreeWalker(
        template.content,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT
    )
    let nodeIndex = -1
    let hasCustomElements = false

    while (walker.nextNode()) {
        nodeIndex++
        const node = walker.currentNode

        if (node instanceof Comment && node.data.startsWith('bfs:')) {
            descriptors.push({
                type: 'child',
                node: nodeIndex,
                value: Number(node.data.slice(4)),
            })
            continue
        }

        if (node instanceof Text && node.data.includes(PREFIX)) {
            descriptors.push({
                type: 'raw',
                node: nodeIndex,
                pieces: parsePieces(node.data),
            })
            node.data = ''
            continue
        }

        if (!(node instanceof Element)) continue
        if (node.localName.includes('-')) hasCustomElements = true

        const attributes = Array.from(node.attributes)
        const hasSpread = attributes.some((attr) => SPREAD.test(attr.name))
        const blocked = attributes
            .filter((attr) => !SPREAD.test(attr.name))
            .map((attr) => attr.name.toLowerCase())

        for (const attr of attributes) {
            const spread = SPREAD.exec(attr.name)
            if (spread) {
                descriptors.push({
                    type: 'spread',
                    node: nodeIndex,
                    value: Number(spread[1]),
                    blocked,
                })
                node.removeAttribute(attr.name)
                continue
            }

            const name = attr.name.toLowerCase()

            if (name === 'ref') {
                const exact = EXACT.exec(attr.value)
                descriptors.push(
                    exact
                        ? {
                              type: 'ref',
                              node: nodeIndex,
                              value: Number(exact[1]),
                          }
                        : {
                              type: 'ref',
                              node: nodeIndex,
                              name: attr.value,
                          }
                )
                node.removeAttribute(attr.name)
                continue
            }

            if (!attr.value.includes(PREFIX)) {
                if (hasSpread) {
                    descriptors.push({
                        type: 'attr',
                        node: nodeIndex,
                        name: attr.name,
                        pieces: [attr.value],
                    })
                    node.removeAttribute(attr.name)
                } else {
                    setElementAttribute(node, attr.name, attr.value)
                }
                continue
            }

            const exact = EXACT.exec(attr.value)
            const valueIndex = exact ? Number(exact[1]) : null

            if (name.startsWith('on') && valueIndex !== null) {
                descriptors.push({
                    type: 'event',
                    node: nodeIndex,
                    name,
                    value: valueIndex,
                })
            } else {
                descriptors.push({
                    type: 'attr',
                    node: nodeIndex,
                    name: attr.name,
                    pieces: parsePieces(attr.value),
                })
            }
            node.removeAttribute(attr.name)
        }
    }

    const definition = { template, parts: descriptors, hasCustomElements }
    if (key) registry.set(key, definition)
    return definition
}

type Item = Node | HtmlTemplate

type ChildRuntime = {
    type: 'child'
    anchor: Text
    value: number
    current: unknown
    items: DoubleLinkedList<Item>
}

type Runtime =
    | ChildRuntime
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
          asProperty: boolean
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

const normalizeItem = (value: unknown): Item => {
    if (value instanceof Node || value instanceof HtmlTemplate) return value
    return document.createTextNode(String(value))
}

const normalizeContent = (value: unknown): Item[] =>
    Array.isArray(value) ? value.map(normalizeItem) : [normalizeItem(value)]

const removeItem = (item: Item) => {
    if (item instanceof HtmlTemplate) item.unmount()
    else item.parentNode?.removeChild(item)
}

const insertItemAfter = (item: Item, previous: Item | Node) => {
    if (item instanceof HtmlTemplate) {
        item.insertAfter(previous)
    } else if (previous instanceof HtmlTemplate) {
        insertNodeAfter(item, previous.__MARKERS__[1])
    } else {
        insertNodeAfter(item, previous)
    }
}

const reconcileItems = (
    current: DoubleLinkedList<Item>,
    nextItems: Item[],
    anchor: Node,
    template: HtmlTemplate
) => {
    if (!nextItems.length) {
        for (const item of current) removeItem(item)
        current.clear()
        return
    }

    const nextSet = new Set(nextItems)

    if (!current.size) {
        const fragment = document.createDocumentFragment()
        for (const item of nextItems) {
            if (item instanceof HtmlTemplate) {
                item.render(fragment)
                item.__PARENT__ = template
                template.__CHILDREN__.add(item)
            } else {
                fragment.appendChild(item)
            }
            current.push(item)
        }
        insertNodeAfter(fragment, anchor)
        return
    }

    let previous: Item | Node = anchor
    let index = 0
    let currentItem: Item | null = current.head

    while (index < nextItems.length || currentItem) {
        const nextItem = index < nextItems.length ? nextItems[index] : null
        const added =
            Boolean(nextItem) &&
            !current.has(nextItem as Item) &&
            currentItem !== nextItem
        let removed = false
        let replaced = false
        let moved = false

        if (!nextItem && currentItem) {
            removed = true
        } else if (currentItem && nextItem) {
            removed = !nextSet.has(currentItem)
            replaced = removed && !current.has(nextItem)
            moved = !removed && !replaced && currentItem !== nextItem
        }

        if (nextItem instanceof HtmlTemplate) {
            nextItem.__PARENT__ = template
            template.__CHILDREN__.add(nextItem)
        }

        if (moved && nextItem) {
            const nextCurrent = current.getNextValueOf(currentItem)
            if (nextCurrent !== nextItem) {
                current.insertValueBefore(nextItem, currentItem as Item)
                insertItemAfter(nextItem, previous)
            } else {
                current.remove(currentItem as Item)
                currentItem = current.getNextValueOf(nextCurrent)
            }
        } else if (replaced && nextItem) {
            insertItemAfter(nextItem, previous)
            removeItem(currentItem as Item)
            const nextCurrent = current.getNextValueOf(currentItem)
            current.insertValueBefore(nextItem, currentItem as Item)
            current.remove(currentItem as Item)
            currentItem = nextCurrent
        } else if (removed) {
            removeItem(currentItem as Item)
            const nextCurrent = current.getNextValueOf(currentItem)
            current.remove(currentItem as Item)
            currentItem = nextCurrent
            continue
        } else if (added && nextItem) {
            insertItemAfter(nextItem, previous)
            current.push(nextItem)
        } else if (currentItem) {
            currentItem = current.getNextValueOf(currentItem)
        }

        if (nextItem) previous = nextItem
        index++
    }
}

const instantiateDefinedCustomElements = (fragment: DocumentFragment) => {
    const elements = Array.from(fragment.querySelectorAll('*'))

    for (const element of elements) {
        if (!element.localName.includes('-')) continue
        const ctor = customElements.get(element.localName)
        if (!ctor || element instanceof ctor) continue

        const replacement = document.createElement(element.localName)
        for (const attr of Array.from(element.attributes)) {
            replacement.setAttribute(attr.name, attr.value)
        }
        while (element.firstChild) replacement.appendChild(element.firstChild)
        element.replaceWith(replacement)
    }
}

const getEventValue = (raw: unknown, name: string) => {
    const [fn, options] = Array.isArray(raw) ? raw : [raw, undefined]

    if (typeof fn !== 'function') {
        throw new Error(
            `Handler for event "${name}" is not a function. Found "${fn}".`
        )
    }

    return {
        fn: fn as EventListener,
        options: options as boolean | AddEventListenerOptions | undefined,
    }
}

export class HtmlTemplate {
    #definition: Definition
    #parts: TemplateStringsArray | string[]
    #values: unknown[]
    #runtime: Runtime[] = []
    #partEffects = new Map<Runtime, EffectUnSubscriber>()
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
            if (
                descriptor.type === 'spread' &&
                !isObjectLiteral(values[descriptor.value])
            ) {
                throw new Error(
                    `Invalid attribute object provided: ${values[descriptor.value]}`
                )
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
        const nodes: Node[] = []
        let node = this.#markers[0].nextSibling
        while (node && node !== this.#markers[1]) {
            nodes.push(node)
            node = node.nextSibling
        }
        return nodes
    }

    get refs(): Record<string, Element[]> {
        const collected: Record<string, Set<Element>> = {}
        const add = (refs: Record<string, Iterable<Element>>) => {
            for (const [name, nodes] of Object.entries(refs)) {
                const target = collected[name] ?? (collected[name] = new Set())
                for (const node of nodes) target.add(node)
            }
        }

        add(this.#refs)
        for (const child of this.__CHILDREN__) add(child.refs)

        return Object.fromEntries(
            Object.entries(collected).map(([name, nodes]) => [name, [...nodes]])
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

    __replaceChildReference(previous: HtmlTemplate, next: HtmlTemplate) {
        for (const part of this.#runtime) {
            if (part.type !== 'child' || !part.items.has(previous)) continue
            part.items.insertValueBefore(next, previous)
            part.items.remove(previous)
            return
        }
    }

    __rebind__(next: HtmlTemplate) {
        if (
            !this.#mounted ||
            next.#mounted ||
            this.#parts !== next.#parts ||
            this.#mountSub ||
            this.#moveSub ||
            this.#updateSub ||
            this.#unmountSub ||
            next.#mountSub ||
            next.#moveSub ||
            next.#updateSub ||
            next.#unmountSub ||
            !this.#values.every(isRebindableValue) ||
            !next.#values.every(isRebindableValue)
        ) {
            return false
        }

        return this.__updateFrom(next)
    }

    #clearChild(part: ChildRuntime) {
        reconcileItems(part.items, [], part.anchor, this)
    }

    #isReactive(part: Runtime) {
        if (part.type === 'child') {
            return typeof this.#values[part.value] === 'function'
        }
        if (part.type === 'raw' || part.type === 'attr') {
            return part.pieces.some(
                (piece) =>
                    typeof piece === 'number' &&
                    typeof this.#values[piece] === 'function'
            )
        }
        if (part.type === 'event') {
            return (
                part.asProperty &&
                typeof this.#values[part.value] === 'function'
            )
        }
        if (part.type === 'ref') {
            return (
                part.value !== undefined &&
                typeof this.#values[part.value] === 'function'
            )
        }

        const source = this.#values[part.value]
        if (!isObjectLiteral(source)) return false
        return Object.entries(source as ObjectLiteral<unknown>).some(
            ([key, value]) => {
                if (typeof value !== 'function') return false
                const name = spreadName(key)
                return !(
                    name.startsWith('on') &&
                    shouldUseEventListener(part.node, name)
                )
            }
        )
    }

    #activatePart(part: Runtime) {
        this.#partEffects.get(part)?.()
        this.#partEffects.delete(part)

        let initialized = false
        let initialChanged = false
        const commit = () => {
            const changed = this.#commit(part, this.#values)
            if (!initialized) {
                initialChanged = changed
                initialized = true
            } else if (changed && this.#mounted) {
                this.#updateSub?.(this)
            }
        }

        if (this.#isReactive(part)) {
            this.#partEffects.set(part, effect(commit))
        } else {
            commit()
        }
        return initialChanged
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
                part.items.size === 1 &&
                part.items.head instanceof HtmlTemplate &&
                part.items.head.__updateFrom(next)
            ) {
                part.current = next
                return true
            }

            if (
                !Array.isArray(next) &&
                !(next instanceof Node) &&
                !(next instanceof HtmlTemplate) &&
                part.items.size === 1 &&
                part.items.head instanceof Text
            ) {
                part.items.head.data = String(next)
                part.current = next
                return true
            }

            reconcileItems(part.items, normalizeContent(next), part.anchor, this)
            part.current = next
            return true
        }

        if (part.type === 'attr') {
            const next = getAttributeValue(part.pieces, values)
            if (Object.is(next, part.current)) return false
            setDynamicValue(part.node, part.name, next)
            part.current = next
            return true
        }

        if (part.type === 'event') {
            const raw = values[part.value]
            if (part.asProperty) {
                const next = resolve(raw)
                if (Object.is(next, part.current)) return false
                setDynamicValue(part.node, part.name, next)
                part.current = next
                return true
            }

            const next = getEventValue(raw, part.name)
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
            const next =
                part.staticName ?? String(resolve(values[part.value!]) ?? '')
            if (next === part.name) return false
            if (part.name) this.__removeRef(part.name, part.node)
            this.__addRef(next, part.node)
            part.name = next
            return true
        }

        const source = values[part.value]
        if (!isObjectLiteral(source)) {
            throw new Error(`Invalid attribute object provided: ${source}`)
        }

        const next = new Map<string, unknown>()
        for (const [key, rawValue] of Object.entries(
            source as ObjectLiteral<unknown>
        )) {
            const name = spreadName(key)
            const value =
                name.startsWith('on') &&
                shouldUseEventListener(part.node, name)
                    ? rawValue
                    : resolve(rawValue)
            next.set(key, value)
        }

        for (const [key, oldValue] of part.current) {
            const name = spreadName(key)
            if (part.blocked.has(name) || next.has(key)) continue
            if (name === 'ref') {
                this.__removeRef(String(oldValue), part.node)
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
                setDynamicValue(part.node, name, undefined)
            }
        }

        let changed = false
        for (const [key, value] of next) {
            const name = spreadName(key)
            if (part.blocked.has(name)) continue
            if (Object.is(part.current.get(key), value)) continue

            if (name === 'ref') {
                const oldValue = part.current.get(key)
                if (oldValue !== undefined) {
                    this.__removeRef(String(oldValue), part.node)
                }
                this.__addRef(String(value ?? ''), part.node)
            } else if (
                name.startsWith('on') &&
                shouldUseEventListener(part.node, name)
            ) {
                const oldEvent = part.events.get(key)
                if (oldEvent) {
                    part.node.removeEventListener(
                        name.slice(2),
                        oldEvent.fn,
                        oldEvent.options
                    )
                }
                const event = getEventValue(value, name)
                part.node.addEventListener(
                    name.slice(2),
                    event.fn,
                    event.options
                )
                part.events.set(key, event)
            } else {
                setDynamicValue(part.node, name, value)
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
            changed = this.#activatePart(part) || changed
        }
        if (changed) this.#updateSub?.(this)
        return true
    }

    #mount(action: 'render' | 'replace' | 'after', target: Node) {
        const fragment = this.#definition.template.content.cloneNode(
            true
        ) as DocumentFragment

        if (this.#definition.hasCustomElements) {
            instantiateDefinedCustomElements(fragment)
            customElements.upgrade?.(fragment)
        }

        this.#runtime = []
        this.#partEffects.clear()

        const descriptors = this.#definition.parts
        const compiledNodes = new Map<number, Node>()

        if (descriptors.length) {
            const requiredIndexes = new Set(
                descriptors.map((descriptor) => descriptor.node)
            )
            const lastNodeIndex = descriptors[descriptors.length - 1].node
            const walker = document.createTreeWalker(
                fragment,
                NodeFilter.SHOW_ELEMENT |
                    NodeFilter.SHOW_COMMENT |
                    NodeFilter.SHOW_TEXT
            )
            let nodeIndex = -1

            while (walker.nextNode()) {
                nodeIndex++
                if (requiredIndexes.has(nodeIndex)) {
                    compiledNodes.set(nodeIndex, walker.currentNode)
                }
                if (nodeIndex >= lastNodeIndex) break
            }
        }

        for (const descriptor of descriptors) {
            const compiledNode = compiledNodes.get(descriptor.node)!
            let part: Runtime

            if (descriptor.type === 'child') {
                const anchor = document.createTextNode('')
                compiledNode.parentNode?.replaceChild(anchor, compiledNode)
                part = {
                    type: 'child',
                    anchor,
                    value: descriptor.value,
                    current: Symbol(),
                    items: new DoubleLinkedList(),
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

        fragment.prepend(this.#markers[0])
        fragment.append(this.#markers[1])

        if (action === 'replace') target.parentNode?.replaceChild(fragment, target)
        else if (action === 'after') insertNodeAfter(fragment, target)
        else target.appendChild(fragment)

        this.#mounted = true
        for (const part of this.#runtime) this.#activatePart(part)

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
        let parentTemplate: HtmlTemplate | null = null

        if (target instanceof HtmlTemplate) {
            node = document.createTextNode('')
            target.__MARKERS__[0].parentNode?.insertBefore(
                node,
                target.__MARKERS__[0]
            )
            parentTemplate = target.__PARENT__
            parentTemplate?.__replaceChildReference(target, this)
            target.unmount()
        }

        if (!node.parentNode) return this

        if (this.#mounted) {
            const fragment = document.createDocumentFragment()
            fragment.append(
                this.#markers[0],
                ...this.childNodes,
                this.#markers[1]
            )
            node.parentNode.replaceChild(fragment, node)
            this.#moveSub?.(this)
        } else {
            this.#mount('replace', node)
        }

        if (parentTemplate) {
            this.__PARENT__ = parentTemplate
            parentTemplate.__CHILDREN__.add(this)
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
                const fragment = document.createDocumentFragment()
                fragment.append(
                    this.#markers[0],
                    ...this.childNodes,
                    this.#markers[1]
                )
                insertNodeAfter(fragment, node)
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

        for (const unsub of this.#partEffects.values()) unsub()
        this.#partEffects.clear()

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
        const output = this.childNodes
            .map((node) =>
                node instanceof Element ? node.outerHTML : node.nodeValue
            )
            .join('')
        this.unmount()
        return output
    }
}

export const html = (
    parts: TemplateStringsArray | string[],
    ...values: unknown[]
) => new HtmlTemplate(parts, values)