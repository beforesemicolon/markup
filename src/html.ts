import { EffectUnSubscriber, ObjectLiteral } from './types.ts'
import { setElementAttribute } from './utils/set-element-attribute.ts'
import { isObjectLiteral } from './utils/is-object-literal.ts'
import { turnCamelToKebabCasing } from './utils/turn-camel-to-kebab-casing.ts'
import { insertNodeAfter } from './utils/insert-node-after.ts'
import { DoubleLinkedList } from './DoubleLinkedList.ts'
import { untrack } from './effect-context.ts'
import { createRenderEffect, isStateGetter } from './state.ts'

const BASE_PREFIX = '__BFS_V2_'
const INITIAL = Symbol()

type Piece = string | number
type LifecycleCallback = (template: HtmlTemplate) => void | (() => void)

type Markers = {
    prefix: string
    token: RegExp
    exact: RegExp
    spread: RegExp
}

type Descriptor =
    | { type: 'child'; node: number; value: number }
    | { type: 'raw'; node: number; pieces: Piece[] }
    | {
          type: 'attr'
          node: number
          name: string
          pieces: Piece[]
          attributeOnly: boolean
      }
    | {
          type: 'event'
          node: number
          name: string
          eventName: string
          useEventListener?: boolean
          value: number
      }
    | {
          type: 'ref'
          node: number
          name?: string
          value?: number
      }
    | {
          type: 'spread'
          node: number
          value: number
          blocked: string[]
      }

type Definition = {
    template: HTMLTemplateElement
    parts: Descriptor[]
    nodeCount: number
    hasCustomElements: boolean
    hasNestedTemplates: boolean
    simpleChild: boolean
    singleRoot: boolean
}

const registry = new WeakMap<TemplateStringsArray, Definition>()
const BATCH_SIZE = 50
const batchTemplates = new WeakMap<Definition, HTMLTemplateElement>()

const getBatchTemplate = (definition: Definition): HTMLTemplateElement => {
    const cached = batchTemplates.get(definition)
    if (cached) return cached

    const batch = document.createElement('template')
    for (let index = 0; index < BATCH_SIZE; index++) {
        batch.content.appendChild(definition.template.content.cloneNode(true))
    }
    batchTemplates.set(definition, batch)
    return batch
}

const createMarkers = (parts: TemplateStringsArray | string[]): Markers => {
    let prefix = BASE_PREFIX
    while (parts.some((part) => part.includes(prefix))) prefix = `_${prefix}`

    return {
        prefix,
        token: new RegExp(`${prefix}(\\d+)__`, 'g'),
        exact: new RegExp(`^${prefix}(\\d+)__$`),
        // HTML parsing preserves a closing quote after an interpolation used as
        // an attribute spread (e.g. `${props}"`). Accept that parser artifact.
        spread: new RegExp(`^${prefix.toLowerCase()}(\\d+)__"?$`),
    }
}

const isTemplateStringsArray = (
    parts: TemplateStringsArray | string[]
): parts is TemplateStringsArray =>
    Object.prototype.hasOwnProperty.call(parts, 'raw')

const parsePieces = (value: string, markers: Markers): Piece[] => {
    const out: Piece[] = []
    let last = 0
    markers.token.lastIndex = 0

    for (
        let match = markers.token.exec(value);
        match;
        match = markers.token.exec(value)
    ) {
        if (match.index > last) out.push(value.slice(last, match.index))
        out.push(Number(match[1]))
        last = match.index + match[0].length
    }

    if (last < value.length) out.push(value.slice(last))
    return out
}

const resolve = (value: unknown): unknown => {
    if (typeof value !== 'function') return value

    const result = (value as () => unknown)()
    return isStateGetter(value) ? result : resolve(result)
}

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
    return out.trimStart()
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
        ? (customElements.get(node.localName) ?? node.constructor)
        : node.constructor

    return (
        (node.nodeName.includes('-') &&
            // @ts-expect-error observedAttributes is a custom-element constructor property
            !ctor?.observedAttributes?.includes(name)) ||
        isKnownHTMLEventName(name)
    )
}

const setDynamicValue = (
    node: Element,
    name: string,
    value: unknown,
    attributeOnly = false,
    initial = false
) => {
    setElementAttribute(node, name, value, attributeOnly, initial)
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

// Native parsing moves text from structural table containers outside the
// table. Turn interpolation tokens into comments first so their positions
// survive parsing and can become normal child-part anchors.
const preserveTableMarkers = (source: string, markers: Markers) => {
    const output: string[] = []
    const stack: string[] = []
    let index = 0

    while (index < source.length) {
        if (source.startsWith(markers.prefix, index)) {
            const end = source.indexOf('__', index + markers.prefix.length)
            if (end !== -1) {
                const marker = source.slice(index, end + 2)
                if (
                    /^(table|thead|tbody|tfoot|tr|colgroup)$/.test(
                        stack[stack.length - 1] ?? ''
                    )
                ) {
                    output.push(
                        `<!--bfs:${marker.slice(markers.prefix.length, -2)}-->`
                    )
                } else {
                    output.push(marker)
                }
                index = end + 2
                continue
            }
        }

        if (source[index] !== '<') {
            output.push(source[index])
            index++
            continue
        }

        let end = index + 1
        let quote = ''
        while (end < source.length) {
            const character = source[end]
            if (quote) {
                if (character === quote) quote = ''
            } else if (character === '"' || character === "'") {
                quote = character
            } else if (character === '>') {
                break
            }
            end++
        }

        const tag = source.slice(index, end + 1)
        output.push(tag)
        const closing = /^<\/\s*([a-z][\w.-]*)/i.exec(tag)
        const opening = /^<\s*([a-z][\w.-]*)/i.exec(tag)
        if (closing) {
            const tagName = closing[1].toLowerCase()
            const stackIndex = stack.lastIndexOf(tagName)
            if (stackIndex !== -1) stack.length = stackIndex
        } else if (
            opening &&
            !/\/\s*>$/.test(tag) &&
            !/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(
                opening[1]
            )
        ) {
            stack.push(opening[1].toLowerCase())
        }
        index = Math.min(end + 1, source.length)
    }

    return output.join('')
}

const parseTemplateSource = (
    template: HTMLTemplateElement,
    source: string,
    markers: Markers
) => {
    const tableRoot = /^<(tr|td|th|tbody|thead|tfoot|colgroup|caption|col)\b/i
        .exec(source)?.[1]
        ?.toLowerCase()

    if (!tableRoot) {
        template.innerHTML = /<table(?:\s|>)/i.test(source)
            ? preserveTableMarkers(source, markers)
            : source
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
    template.innerHTML = preserveTableMarkers(
        `${before}${source}${after}`,
        markers
    )
    extractTableContext(template, selector)
}

const removeStructuralTableWhitespace = (root: DocumentFragment): void => {
    const structuralElements = root.querySelectorAll(
        'table,thead,tbody,tfoot,tr,colgroup'
    )

    for (const element of structuralElements) {
        let child = element.firstChild
        while (child) {
            const next = child.nextSibling
            if (child instanceof Text && !child.data.trim()) child.remove()
            child = next
        }
    }
}

const collectNodes = (root: Node, whatToShow: number): Node[] => {
    const nodes: Node[] = []
    const pending: Node[] = []
    const enqueueChildren = (parent: Node): void => {
        let child = parent.lastChild
        while (child) {
            pending.push(child)
            child = child.previousSibling
        }
    }

    enqueueChildren(root)
    while (pending.length) {
        const node = pending.pop()
        if (!node) continue

        const nodeMask = 1 << (node.nodeType - 1)
        if (whatToShow === NodeFilter.SHOW_ALL || whatToShow & nodeMask) {
            nodes.push(node)
        }

        enqueueChildren(
            node instanceof HTMLTemplateElement ? node.content : node
        )
    }

    return nodes
}

const collectDescriptorNodesDeep = (
    root: Node,
    descriptors: Descriptor[]
): Node[] => {
    const nodes = new Array<Node>(descriptors.length)
    const pending: Node[] = []
    const enqueueChildren = (parent: Node): void => {
        let child = parent.lastChild
        while (child) {
            pending.push(child)
            child = child.previousSibling
        }
    }
    let nodeIndex = 0
    let descriptorIndex = 0

    enqueueChildren(root)
    while (pending.length && descriptorIndex < descriptors.length) {
        const node = pending.pop()
        if (!node) continue

        while (descriptors[descriptorIndex]?.node === nodeIndex) {
            nodes[descriptorIndex] = node
            descriptorIndex++
        }
        nodeIndex++
        enqueueChildren(
            node instanceof HTMLTemplateElement ? node.content : node
        )
    }

    return nodes
}

const collectDescriptorNodes = (
    root: Node,
    descriptors: Descriptor[]
): Node[] => {
    const nodes = new Array<Node>(descriptors.length)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL)
    let descriptorIndex = 0
    let nodeIndex = 0
    let node = walker.nextNode()

    while (node && descriptorIndex < descriptors.length) {
        while (descriptors[descriptorIndex]?.node === nodeIndex) {
            nodes[descriptorIndex] = node
            descriptorIndex++
        }
        nodeIndex++
        node = walker.nextNode()
    }

    return descriptorIndex === descriptors.length
        ? nodes
        : collectDescriptorNodesDeep(root, descriptors)
}

const collectBatchDescriptorNodes = (
    root: DocumentFragment,
    definition: Definition,
    count: number
): Node[] | null => {
    const descriptors = definition.parts
    const nodes = new Array<Node>(descriptors.length * count)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL)
    let descriptorIndex = 0
    let nodeIndex = 0
    let node = walker.nextNode()

    while (node && descriptorIndex < nodes.length) {
        while (descriptorIndex < nodes.length) {
            const templateIndex = Math.floor(
                descriptorIndex / descriptors.length
            )
            const descriptor = descriptors[descriptorIndex % descriptors.length]
            const expectedNodeIndex =
                templateIndex * definition.nodeCount + descriptor.node
            if (nodeIndex !== expectedNodeIndex) break

            nodes[descriptorIndex] = node
            descriptorIndex++
        }

        nodeIndex++
        node = walker.nextNode()
    }

    return descriptorIndex === nodes.length ? nodes : null
}

function compile(parts: TemplateStringsArray | string[]): Definition {
    const key = isTemplateStringsArray(parts) ? parts : null
    const cached = key ? registry.get(key) : undefined
    if (cached) return cached

    const markers = createMarkers(parts)
    let source = parts[0] ?? ''
    for (let index = 1; index < parts.length; index++) {
        source += `${markers.prefix}${index - 1}__${parts[index]}`
    }

    const dynamicOpeningTag = new RegExp(`<(${markers.prefix}\\d+__)`, 'g')
    const dynamicClosingTag = new RegExp(`</(${markers.prefix}\\d+__)`, 'g')
    source = source
        .replace(dynamicOpeningTag, '&lt;$1')
        .replace(dynamicClosingTag, '&lt;/$1')
        .replace(/<([a-z][\w.-]*-[\w.-]+)([^>]*)\/>/gi, '<$1$2></$1>')

    const template = document.createElement('template')
    parseTemplateSource(template, source.trim(), markers)
    removeStructuralTableWhitespace(template.content)

    const dynamicText = collectNodes(template.content, NodeFilter.SHOW_TEXT)
        .filter((node): node is Text => node instanceof Text)
        .filter((text) => text.data.includes(markers.prefix))

    for (const text of dynamicText) {
        if (text.parentElement?.matches('script,style')) continue

        const fragment = document.createDocumentFragment()
        for (const part of parsePieces(text.data, markers)) {
            fragment.append(
                typeof part === 'number'
                    ? document.createTextNode(`${markers.prefix}${part}__`)
                    : document.createTextNode(part)
            )
        }
        text.replaceWith(fragment)
    }

    const templateNodeIndexes = new WeakMap<Node, number>()
    const templateNodes = collectNodes(template.content, NodeFilter.SHOW_ALL)
    for (let index = 0; index < templateNodes.length; index++) {
        templateNodeIndexes.set(templateNodes[index], index)
    }

    const descriptors: Descriptor[] = []
    const descriptorNodes = collectNodes(
        template.content,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT
    )
    let hasCustomElements = false

    for (const node of descriptorNodes) {
        if (node instanceof Comment && node.data.startsWith('bfs:')) {
            descriptors.push({
                type: 'child',
                node: templateNodeIndexes.get(node)!,
                value: Number(node.data.slice(4)),
            })
            continue
        }

        if (node instanceof Text) {
            const exact = markers.exact.exec(node.data)
            if (exact) {
                descriptors.push({
                    type: 'child',
                    node: templateNodeIndexes.get(node)!,
                    value: Number(exact[1]),
                })
                node.data = ''
                continue
            }
        }

        if (node instanceof Text && node.data.includes(markers.prefix)) {
            descriptors.push({
                type: 'raw',
                node: templateNodeIndexes.get(node)!,
                pieces: parsePieces(node.data, markers),
            })
            node.data = ''
            continue
        }

        if (!(node instanceof Element)) continue
        if (node.localName.includes('-')) hasCustomElements = true

        const attributes = Array.from(node.attributes)
        const hasSpread = attributes.some((attr) =>
            markers.spread.test(attr.name)
        )
        const blocked = attributes
            .filter((attr) => !markers.spread.test(attr.name))
            .map((attr) => attr.name.toLowerCase())

        for (const attr of attributes) {
            const spread = markers.spread.exec(attr.name)
            if (spread) {
                descriptors.push({
                    type: 'spread',
                    node: templateNodeIndexes.get(node)!,
                    value: Number(spread[1]),
                    blocked,
                })
                node.removeAttribute(attr.name)
                continue
            }

            const name = attr.name.toLowerCase()

            if (name === 'ref') {
                const exact = markers.exact.exec(attr.value)
                descriptors.push(
                    exact
                        ? {
                              type: 'ref',
                              node: templateNodeIndexes.get(node)!,
                              value: Number(exact[1]),
                          }
                        : {
                              type: 'ref',
                              node: templateNodeIndexes.get(node)!,
                              name: attr.value,
                          }
                )
                node.removeAttribute(attr.name)
                continue
            }

            if (!attr.value.includes(markers.prefix)) {
                if (hasSpread) {
                    descriptors.push({
                        type: 'attr',
                        node: templateNodeIndexes.get(node)!,
                        name: attr.name,
                        pieces: [attr.value],
                        attributeOnly:
                            !node.localName.includes('-') &&
                            !(attr.name in node),
                    })
                    node.removeAttribute(attr.name)
                } else {
                    setElementAttribute(node, attr.name, attr.value)
                }
                continue
            }

            const exact = markers.exact.exec(attr.value)
            const valueIndex = exact ? Number(exact[1]) : null

            if (name.startsWith('on') && valueIndex !== null) {
                descriptors.push({
                    type: 'event',
                    node: templateNodeIndexes.get(node)!,
                    name,
                    eventName: name.slice(2),
                    useEventListener: node.localName.includes('-')
                        ? undefined
                        : shouldUseEventListener(node, name),
                    value: valueIndex,
                })
            } else {
                descriptors.push({
                    type: 'attr',
                    node: templateNodeIndexes.get(node)!,
                    name: attr.name,
                    pieces: parsePieces(attr.value, markers),
                    attributeOnly:
                        !node.localName.includes('-') && !(attr.name in node),
                })
            }
            node.removeAttribute(attr.name)
        }
    }

    const simpleChild =
        descriptors.length === 1 &&
        descriptors[0].type === 'child' &&
        descriptors[0].node === 0 &&
        template.content.childNodes.length === 1

    const definition = {
        template,
        parts: descriptors,
        nodeCount: templateNodes.length,
        hasCustomElements,
        hasNestedTemplates: Boolean(template.content.querySelector('template')),
        simpleChild,
        singleRoot:
            template.content.childNodes.length === 1 &&
            template.content.firstChild instanceof Element,
    }
    if (key) registry.set(key, definition)
    return definition
}

type Item = Node | HtmlTemplate
const stagedMounts = new WeakSet<HtmlTemplate>()
let hasStagedMounts = false

type ChildRuntime = {
    type: 'child'
    anchor: Text
    value: number
    current: unknown
    inline: boolean
    items?: DoubleLinkedList<Item>
    text?: Text
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
          attributeOnly: boolean
          current: unknown
      }
    | {
          type: 'event'
          node: Element
          name: string
          eventName: string
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
    if (value instanceof HtmlTemplate || value instanceof Node) return value
    return document.createTextNode(String(value))
}

const normalizeContent = (value: unknown): Item[] => {
    if (!Array.isArray(value)) return [normalizeItem(value)]
    if (!value.length) return value as Item[]

    const first = value[0]
    if (first instanceof HtmlTemplate || first instanceof Node) {
        for (let index = 1; index < value.length; index++) {
            const item = value[index]
            if (!(item instanceof HtmlTemplate || item instanceof Node)) {
                return value.map(normalizeItem)
            }
        }
        return value as Item[]
    }

    return value.map(normalizeItem)
}

const removeItem = (item: Item) => {
    if (item instanceof HtmlTemplate) item.unmount()
    else item.parentNode?.removeChild(item)
}

const insertItemAfter = (item: Item, previous: Item | Node) => {
    if (item instanceof HtmlTemplate) {
        item.insertAfter(previous)
        return
    }

    const reference =
        previous instanceof HtmlTemplate ? previous.__MARKERS__[1] : previous
    const insert = () => insertNodeAfter(item, reference)

    if (reference.isConnected) untrack(insert)
    else insert()
}

const canStageItems = (items: Item[]): boolean => {
    for (const item of items) {
        if (item instanceof HtmlTemplate) {
            if (item.mounted || (hasStagedMounts && stagedMounts.has(item))) {
                return false
            }
        } else if (item.isConnected) {
            return false
        }
    }
    return true
}

const stageItems = (
    items: Item[],
    template: HtmlTemplate
): DocumentFragment => {
    if (
        items.every(
            (item): item is HtmlTemplate => item instanceof HtmlTemplate
        )
    ) {
        const batch = HtmlTemplate.__stageBatch__(items, template)
        if (batch) return batch
    }

    const fragment = document.createDocumentFragment()

    for (const item of items) {
        if (item instanceof HtmlTemplate) {
            item.render(fragment)
            item.__PARENT__ = template
            template.__CHILDREN__.add(item)
        } else {
            fragment.appendChild(item)
        }
    }

    return fragment
}

const insertFragmentAfter = (
    fragment: DocumentFragment,
    anchor: Node
): void => {
    const insert = () => insertNodeAfter(fragment, anchor)
    if (anchor.isConnected) untrack(insert)
    else insert()
}

const getItemRange = (item: Item): [Node, Node] =>
    item instanceof HtmlTemplate ? item.__MARKERS__ : [item, item]

const isContiguousRange = (
    current: DoubleLinkedList<Item>,
    anchor: Node
): boolean => {
    let expected = anchor.nextSibling

    for (const item of current) {
        const [first, last] = getItemRange(item)
        if (first !== expected) return false
        expected = last.nextSibling
    }

    return true
}

const removeContiguousRange = (
    current: DoubleLinkedList<Item>,
    anchor: Node,
    template: HtmlTemplate
): boolean => {
    if (!current.size || !isContiguousRange(current, anchor)) return false

    const tail = current.tail
    if (!tail) return false
    const first = anchor.nextSibling
    const last = getItemRange(tail)[1]
    if (!first) return false

    const range = document.createRange()
    range.setStartBefore(first)
    range.setEndAfter(last)
    range.deleteContents()
    range.detach()

    template.__disposeChildRange__(current)
    current.clear()

    return true
}

const reconcileItems = (
    current: DoubleLinkedList<Item>,
    nextItems: Item[],
    anchor: Node,
    template: HtmlTemplate
) => {
    if (!nextItems.length) {
        if (removeContiguousRange(current, anchor, template)) return
        for (const item of current) removeItem(item)
        current.clear()
        return
    }

    if (!current.size) {
        if (canStageItems(nextItems)) {
            insertFragmentAfter(stageItems(nextItems, template), anchor)
            for (const item of nextItems) current.push(item)
            return
        }

        let previous: Item | Node = anchor

        for (const item of nextItems) {
            insertItemAfter(item, previous)

            if (item instanceof HtmlTemplate) {
                item.__PARENT__ = template
                template.__CHILDREN__.add(item)
            }

            current.push(item)
            previous = item
        }
        return
    }

    if (nextItems.length > current.size) {
        let currentItem: Item | null = current.head
        let prefixMatches = true

        for (let index = 0; index < current.size; index++) {
            if (nextItems[index] !== currentItem) {
                prefixMatches = false
                break
            }
            currentItem = current.getNextValueOf(currentItem)
        }

        if (prefixMatches) {
            const appended = nextItems.slice(current.size)
            if (canStageItems(appended)) {
                const tail = current.tail
                const insertionPoint = tail ? getItemRange(tail)[1] : anchor
                insertFragmentAfter(
                    stageItems(appended, template),
                    insertionPoint
                )
                for (const item of appended) current.push(item)
                return
            }
        }
    }

    if (current.size === nextItems.length) {
        let currentItem: Item | null = current.head
        let same = true

        for (const nextItem of nextItems) {
            if (currentItem !== nextItem) {
                same = false
                break
            }
            currentItem = current.getNextValueOf(currentItem)
        }

        if (same) return
    }

    const nextSet = new Set(nextItems)

    if (
        canStageItems(nextItems) &&
        !Array.from(current).some((item) => nextSet.has(item)) &&
        removeContiguousRange(current, anchor, template)
    ) {
        insertFragmentAfter(stageItems(nextItems, template), anchor)
        for (const item of nextItems) current.push(item)
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
    const elements = collectNodes(fragment, NodeFilter.SHOW_ELEMENT).filter(
        (node): node is Element => node instanceof Element
    )

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

const upgradeCustomElements = (fragment: DocumentFragment): void => {
    customElements.upgrade?.(fragment)

    for (const node of collectNodes(fragment, NodeFilter.SHOW_ELEMENT)) {
        if (node instanceof HTMLTemplateElement) {
            customElements.upgrade?.(node.content)
        }
    }
}

const mountFragment = (
    action: 'render' | 'replace' | 'after',
    target: Node,
    fragment: DocumentFragment
) => {
    const insert = () => {
        if (action === 'replace') {
            target.parentNode?.replaceChild(fragment, target)
        } else if (action === 'after') {
            insertNodeAfter(fragment, target)
        } else {
            target.appendChild(fragment)
        }
    }

    // Disconnected targets cannot invoke custom-element callbacks. ShadowRoot
    // also extends DocumentFragment, so use the actual connection state here.
    if (target.isConnected) untrack(insert)
    else insert()
}

const getEventValue = (raw: unknown, name: string) => {
    const event = Array.isArray(raw) ? raw : undefined
    const fn = event ? event[0] : raw
    const options = event?.[1]

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
    #primaryEffectPart?: Runtime
    #primaryEffectUnsubscribe?: EffectUnSubscriber
    #additionalPartEffects?: Map<Runtime, EffectUnSubscriber>
    #markers?: [Node, Node]
    #refs?: Record<string, Set<Element>>
    #mounted = false
    #mountSub?: LifecycleCallback
    #moveSub?: LifecycleCallback
    #updateSub?: LifecycleCallback
    #unmountSub?: LifecycleCallback

    /** @internal */
    __PARENT__: HtmlTemplate | null = null
    #children?: Set<HtmlTemplate>

    /** @internal */
    get __CHILDREN__(): Set<HtmlTemplate> {
        return (this.#children ??= new Set())
    }

    /**
     * Manually constructed string arrays are parsed as raw HTML. Prefer the
     * `html` tag for normal templates and `unsafeHTML` when raw markup is
     * intentional.
     */
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

    /** @internal */
    static __stageBatch__(
        templates: HtmlTemplate[],
        parent: HtmlTemplate
    ): DocumentFragment | null {
        if (templates.length < BATCH_SIZE) {
            return null
        }

        const definition = templates[0].#definition
        if (
            !definition.singleRoot ||
            definition.simpleChild ||
            !definition.parts.length ||
            definition.hasCustomElements ||
            definition.hasNestedTemplates
        ) {
            return null
        }

        for (const template of templates) {
            if (
                template.#mounted ||
                template.#definition !== definition ||
                template.#mountSub ||
                template.#moveSub ||
                template.#updateSub ||
                template.#unmountSub
            ) {
                return null
            }
        }

        const output = document.createDocumentFragment()
        const batch = getBatchTemplate(definition)
        const descriptorCount = definition.parts.length

        const batchCount =
            Math.floor(templates.length / BATCH_SIZE) * BATCH_SIZE
        for (
            let batchStart = 0;
            batchStart < batchCount;
            batchStart += BATCH_SIZE
        ) {
            const fragment = batch.content.cloneNode(true) as DocumentFragment
            const roots = Array.from(fragment.childNodes)
            if (roots.length !== BATCH_SIZE) return null

            const clonedNodes = collectBatchDescriptorNodes(
                fragment,
                definition,
                BATCH_SIZE
            )
            if (!clonedNodes) return null

            for (let index = 0; index < BATCH_SIZE; index++) {
                const template = templates[batchStart + index]
                template.#markers = [roots[index], roots[index]]
                template.#initializeRuntime(
                    clonedNodes,
                    index * descriptorCount
                )
                template.#mounted = true
                template.__PARENT__ = parent
                parent.__CHILDREN__.add(template)
            }

            output.appendChild(fragment)
        }

        for (let index = batchCount; index < templates.length; index++) {
            const template = templates[index]
            template.render(output)
            template.__PARENT__ = parent
            parent.__CHILDREN__.add(template)
        }

        return output
    }

    get mounted() {
        return this.#mounted
    }

    get #rangeMarkers(): [Node, Node] {
        return (this.#markers ??= [
            document.createTextNode(''),
            document.createTextNode(''),
        ])
    }

    get parentNode(): ParentNode | null {
        return this.#markers?.[0].parentNode ?? null
    }

    /** @internal */
    get __MARKERS__() {
        return this.#rangeMarkers
    }

    get childNodes() {
        const nodes: Node[] = []
        if (!this.#markers) return nodes

        if (this.#markers[0] === this.#markers[1]) {
            return this.#markers[0].parentNode ? [this.#markers[0]] : nodes
        }

        let node = this.#markers[0].nextSibling
        while (node && node !== this.#markers[1]) {
            nodes.push(node)
            node = node.nextSibling
        }
        return nodes
    }

    #appendRangeTo(target: ParentNode): void {
        const markers = this.#rangeMarkers
        if (markers[0] === markers[1]) {
            target.append(markers[0])
            return
        }

        target.append(markers[0], ...this.childNodes, markers[1])
    }

    #setFragmentRange(fragment: DocumentFragment): void {
        const root = fragment.firstChild
        if (this.#definition.singleRoot && root) {
            this.#markers = [root, root]
            return
        }

        const markers = this.#rangeMarkers
        fragment.prepend(markers[0])
        fragment.append(markers[1])
    }

    get refs(): Record<string, Element[]> {
        const collected: Record<string, Set<Element>> = {}
        const add = (refs: Record<string, Iterable<Element>>) => {
            for (const [name, nodes] of Object.entries(refs)) {
                const target = collected[name] ?? (collected[name] = new Set())
                for (const node of nodes) target.add(node)
            }
        }

        if (this.#refs) add(this.#refs)
        for (const child of this.__CHILDREN__) add(child.refs)

        return Object.fromEntries(
            Object.entries(collected).map(([name, nodes]) => [name, [...nodes]])
        )
    }

    /** @internal */
    __addRef(name: string, node: Element) {
        if (!name) return
        const refs = (this.#refs ??= {})
        ;(refs[name] ??= new Set()).add(node)
    }

    /** @internal */
    __removeRef(name: string, node: Element) {
        if (!this.#refs) return
        this.#refs[name]?.delete(node)
        if (!this.#refs[name]?.size) delete this.#refs[name]
    }

    /** @internal */
    __replaceChildReference(previous: HtmlTemplate, next: HtmlTemplate) {
        for (const part of this.#runtime) {
            if (part.type !== 'child' || !part.items?.has(previous)) continue
            part.items.insertValueBefore(next, previous)
            part.items.remove(previous)
            return
        }
    }

    /** @internal */
    __disposeChildRange__(items: Iterable<Item>): void {
        const children = this.#children
        if (children) {
            let ownedCount = 0
            let allOwned = true
            for (const item of items) {
                if (!(item instanceof HtmlTemplate)) continue
                ownedCount++
                if (item.__PARENT__ !== this || !children.has(item)) {
                    allOwned = false
                }
            }

            if (allOwned && ownedCount === children.size) {
                children.clear()
                this.#children = undefined
            } else {
                for (const item of items) {
                    if (item instanceof HtmlTemplate) children.delete(item)
                }
            }
        }

        for (const item of items) {
            if (!(item instanceof HtmlTemplate)) continue
            if (item.__PARENT__ === this) item.__PARENT__ = null
            item.#dispose(false, false)
        }
    }

    #valuesAreRebindable(values: unknown[]) {
        return values.every((value, valueIndex) => {
            if (isRebindableValue(value)) return true
            if (typeof value !== 'function') return false

            let referenced = false
            for (const part of this.#runtime) {
                const usesValue =
                    part.type === 'event' || part.type === 'ref'
                        ? part.value === valueIndex
                        : (part.type === 'raw' || part.type === 'attr') &&
                          part.pieces.includes(valueIndex)

                if (!usesValue) continue
                referenced = true

                if (
                    part.type === 'child' ||
                    part.type === 'spread' ||
                    (part.type === 'event' && part.asProperty)
                ) {
                    return false
                }
            }

            return referenced
        })
    }

    /** @internal */
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
            !this.#valuesAreRebindable(this.#values) ||
            !this.#valuesAreRebindable(next.#values)
        ) {
            return false
        }

        return this.__updateFrom(next)
    }

    #isReactive(part: Runtime) {
        if (part.type === 'child') {
            return typeof this.#values[part.value] === 'function'
        }
        if (part.type === 'raw' || part.type === 'attr') {
            for (const piece of part.pieces) {
                if (
                    typeof piece === 'number' &&
                    typeof this.#values[piece] === 'function'
                ) {
                    return true
                }
            }
            return false
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
        for (const [key, value] of Object.entries(
            source as ObjectLiteral<unknown>
        )) {
            if (typeof value !== 'function') continue
            const name = spreadName(key)
            if (
                !name.startsWith('on') ||
                !shouldUseEventListener(part.node, name)
            ) {
                return true
            }
        }
        return false
    }

    #activatePart(part: Runtime) {
        if (part.type === 'event' && !part.asProperty) {
            return this.#commit(part, this.#values)
        }

        if (this.#primaryEffectPart === part) {
            this.#primaryEffectUnsubscribe?.()
            this.#primaryEffectPart = undefined
            this.#primaryEffectUnsubscribe = undefined
        } else {
            this.#additionalPartEffects?.get(part)?.()
            this.#additionalPartEffects?.delete(part)
        }

        const reactive = this.#isReactive(part)
        if (part.type === 'child') part.inline = !reactive

        if (!reactive) {
            return this.#commit(part, this.#values)
        }

        let initialized = false
        let initialChanged = false
        const commit = () => {
            const changed = this.#commit(part, this.#values)
            if (!initialized) {
                initialChanged = changed
                initialized = true
            } else if (changed && this.#mounted) {
                untrack(() => this.#updateSub?.(this))
            }
        }

        const unsubscribe = untrack(() => createRenderEffect(commit))
        if (!this.#primaryEffectUnsubscribe) {
            this.#primaryEffectPart = part
            this.#primaryEffectUnsubscribe = unsubscribe
        } else {
            ;(this.#additionalPartEffects ??= new Map()).set(part, unsubscribe)
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

            const isPrimitive =
                !Array.isArray(next) &&
                !(next instanceof Node) &&
                !(next instanceof HtmlTemplate)

            if (isPrimitive) {
                const text = String(next)
                if (part.inline) {
                    if (part.items?.size) {
                        reconcileItems(part.items, [], part.anchor, this)
                        part.items = undefined
                    }
                    part.anchor.data = text
                    part.current = next
                    return true
                }

                if (part.text) {
                    part.text.data = text
                    part.current = next
                    return true
                }

                if (part.items?.size === 1 && part.items.head instanceof Text) {
                    part.items.head.data = text
                    part.current = next
                    return true
                }

                if (!part.items?.size) {
                    const textNode = document.createTextNode(text)
                    part.text = textNode
                    insertNodeAfter(textNode, part.anchor)
                    part.current = next
                    return true
                }
            }

            if (part.inline) part.anchor.data = ''

            if (part.text) {
                part.items = new DoubleLinkedList()
                part.items.push(part.text)
                part.text = undefined
            }

            const items = (part.items ??= new DoubleLinkedList())

            if (
                next instanceof HtmlTemplate &&
                items.size === 1 &&
                items.head instanceof HtmlTemplate &&
                items.head.__updateFrom(next)
            ) {
                part.current = next
                return true
            }

            reconcileItems(items, normalizeContent(next), part.anchor, this)
            part.current = next
            return true
        }

        if (part.type === 'attr') {
            const next = getAttributeValue(part.pieces, values)
            if (Object.is(next, part.current)) return false
            setDynamicValue(
                part.node,
                part.name,
                next,
                part.attributeOnly,
                part.current === INITIAL
            )
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

            const event = Array.isArray(raw) ? raw : undefined
            const fn = event ? event[0] : raw
            const options = event?.[1] as
                | boolean
                | AddEventListenerOptions
                | undefined
            if (typeof fn !== 'function') {
                throw new Error(
                    `Handler for event "${part.name}" is not a function. Found "${fn}".`
                )
            }
            if (fn === part.fn && options === part.options) return false
            if (part.fn) {
                part.node.removeEventListener(
                    part.eventName,
                    part.fn,
                    part.options
                )
            }
            part.node.addEventListener(part.eventName, fn, options)
            part.fn = fn
            part.options = options
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
                name.startsWith('on') && shouldUseEventListener(part.node, name)
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

    /** @internal */
    __updateFrom(next: HtmlTemplate) {
        if (!this.#mounted || next.#mounted || this.#parts !== next.#parts) {
            return false
        }

        this.#values = next.#values
        let changed = false
        for (const part of this.#runtime) {
            changed = this.#activatePart(part) || changed
        }
        if (changed) untrack(() => this.#updateSub?.(this))
        return true
    }

    #initializeRuntime(clonedNodes: Node[], offset = 0): void {
        const descriptors = this.#definition.parts
        this.#runtime = []
        this.#primaryEffectPart = undefined
        this.#primaryEffectUnsubscribe = undefined
        this.#additionalPartEffects = undefined

        for (let index = 0; index < descriptors.length; index++) {
            const descriptor = descriptors[index]
            const compiledNode = clonedNodes[offset + index]
            let part: Runtime

            if (descriptor.type === 'child') {
                const anchor =
                    compiledNode instanceof Text
                        ? compiledNode
                        : document.createTextNode('')
                if (!(compiledNode instanceof Text)) {
                    compiledNode.parentNode?.replaceChild(anchor, compiledNode)
                }
                part = {
                    type: 'child',
                    anchor,
                    value: descriptor.value,
                    current: INITIAL,
                    inline: false,
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
                    attributeOnly: descriptor.attributeOnly,
                    current: INITIAL,
                }
            } else if (descriptor.type === 'event') {
                const node = compiledNode as Element
                part = {
                    type: 'event',
                    node,
                    name: descriptor.name,
                    eventName: descriptor.eventName,
                    value: descriptor.value,
                    asProperty: !(
                        descriptor.useEventListener ??
                        shouldUseEventListener(node, descriptor.name)
                    ),
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
            this.#activatePart(part)
        }
    }

    #mount(action: 'render' | 'replace' | 'after', target: Node) {
        if (this.#definition.simpleChild) {
            const markers = this.#rangeMarkers
            const descriptor = this.#definition.parts[0]
            if (descriptor.type !== 'child') return

            const initial = this.#values[descriptor.value]
            const canInline =
                typeof initial !== 'function' &&
                !Array.isArray(initial) &&
                !(initial instanceof Node) &&
                !(initial instanceof HtmlTemplate)
            const anchor = document.createTextNode(
                canInline ? String(initial) : ''
            )
            const fragment = document.createDocumentFragment()
            fragment.append(markers[0], anchor)
            fragment.append(markers[1])

            mountFragment(action, target, fragment)

            const part: ChildRuntime = {
                type: 'child',
                anchor,
                value: descriptor.value,
                current: canInline ? initial : INITIAL,
                inline: canInline,
            }
            this.#runtime = [part]
            this.#mounted = true
            if (!canInline) this.#activatePart(part)

            if (this.#mountSub) {
                const mount = this.#mountSub
                const cleanup = untrack(() => mount(this))
                if (typeof cleanup === 'function') this.#unmountSub = cleanup
            }
            return
        }

        const fragment = this.#definition.template.content.cloneNode(
            true
        ) as DocumentFragment

        if (this.#definition.hasCustomElements) {
            instantiateDefinedCustomElements(fragment)
            upgradeCustomElements(fragment)
        }

        const descriptors = this.#definition.parts

        if (!descriptors.length) {
            this.#runtime = []
            this.#primaryEffectPart = undefined
            this.#primaryEffectUnsubscribe = undefined
            this.#additionalPartEffects = undefined
            this.#setFragmentRange(fragment)

            mountFragment(action, target, fragment)

            this.#mounted = true
            if (this.#mountSub) {
                const mount = this.#mountSub
                const cleanup = untrack(() => mount(this))
                if (typeof cleanup === 'function') this.#unmountSub = cleanup
            }
            return
        }

        const clonedNodes = collectDescriptorNodes(fragment, descriptors)
        this.#setFragmentRange(fragment)
        this.#initializeRuntime(clonedNodes)

        mountFragment(action, target, fragment)

        this.#mounted = true

        if (this.#mountSub) {
            const mount = this.#mountSub
            const cleanup = untrack(() => mount(this))
            if (typeof cleanup === 'function') this.#unmountSub = cleanup
        }
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
                const move = () => this.#appendRangeTo(target)

                if (target.isConnected) untrack(move)
                else move()

                if (!(target instanceof DocumentFragment) && this.#moveSub) {
                    const onMove = this.#moveSub
                    untrack(() => onMove(this))
                }
            }
        } else {
            this.#mount('render', target)
        }
        return this
    }

    replace(target: Node | HtmlTemplate) {
        if (
            !(target instanceof HtmlTemplate || target instanceof Node) ||
            target instanceof ShadowRoot ||
            target instanceof HTMLBodyElement ||
            target instanceof HTMLHeadElement ||
            target instanceof HTMLHtmlElement
        ) {
            throw new Error(
                `Invalid "replace" target element. Received ${target}`
            )
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
            const markers = this.#rangeMarkers
            if (markers[0] === markers[1]) {
                untrack(() => node.parentNode?.replaceChild(markers[0], node))
            } else {
                const fragment = document.createDocumentFragment()
                this.#appendRangeTo(fragment)
                untrack(() => node.parentNode?.replaceChild(fragment, node))
            }
            untrack(() => this.#moveSub?.(this))
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
            !(target instanceof HtmlTemplate || target instanceof Node) ||
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
            const markers = this.#rangeMarkers
            if (node.nextSibling !== markers[0]) {
                if (markers[0] === markers[1]) {
                    untrack(() => insertNodeAfter(markers[0], node))
                } else {
                    const fragment = document.createDocumentFragment()
                    this.#appendRangeTo(fragment)
                    untrack(() => insertNodeAfter(fragment, node))
                }
                untrack(() => this.#moveSub?.(this))
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

    #dispose(removeDom: boolean, detachFromParent: boolean) {
        if (!this.#mounted) return

        this.#primaryEffectUnsubscribe?.()
        this.#primaryEffectPart = undefined
        this.#primaryEffectUnsubscribe = undefined
        if (this.#additionalPartEffects) {
            for (const unsubscribe of this.#additionalPartEffects.values()) {
                unsubscribe()
            }
            this.#additionalPartEffects.clear()
            this.#additionalPartEffects = undefined
        }

        // Dispose nested templates without individually removing their DOM. The
        // root range is removed once below, avoiding O(n) descendant DOM teardown.
        if (this.#children) {
            for (const child of this.#children) {
                child.#dispose(false, false)
            }
            this.#children.clear()
            this.#children = undefined
        }

        if (removeDom) {
            const markers = this.#rangeMarkers
            let node: Node | null = markers[0]
            while (node) {
                const next: Node | null = node.nextSibling
                node.parentNode?.removeChild(node)
                if (node === markers[1]) break
                node = next
            }
        }

        if (detachFromParent) this.__PARENT__?.__CHILDREN__.delete(this)
        this.__PARENT__ = null
        this.#runtime = []
        this.#refs = undefined
        this.#markers = undefined
        this.#mounted = false
        if (this.#unmountSub) {
            const unmount = this.#unmountSub
            untrack(() => unmount(this))
        }
    }

    unmount() {
        this.#dispose(true, true)
        return this
    }

    onMount(cb: LifecycleCallback) {
        this.#mountSub = cb
        stagedMounts.add(this)
        hasStagedMounts = true
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

export function html(
    parts: TemplateStringsArray,
    ...values: unknown[]
): HtmlTemplate
/**
 * @deprecated Manually constructed template arrays are parsed as raw HTML.
 * Use `unsafeHTML` when raw markup is intentional.
 */
export function html(parts: string[], ...values: unknown[]): HtmlTemplate
export function html(
    parts: TemplateStringsArray | string[],
    ...values: unknown[]
): HtmlTemplate
export function html(
    parts: TemplateStringsArray | string[],
    ...values: unknown[]
): HtmlTemplate {
    return new HtmlTemplate(parts, values)
}

/**
 * Parses a string as raw HTML.
 *
 * Only pass trusted or independently sanitized markup. For ordinary dynamic
 * values, use the `html` tagged template so interpolations remain outside the
 * browser's HTML parser.
 */
export const unsafeHTML = (source: string): HtmlTemplate =>
    new HtmlTemplate([source], [])
