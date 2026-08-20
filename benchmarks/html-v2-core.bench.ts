import 'global-jsdom/register'
import { Bench } from 'tinybench'
import { html as currentHtml, HtmlTemplate as CurrentHtmlTemplate } from '../src/html.ts'

type LifecycleCallback = (template: HtmlV2) => void | (() => void)

type PartDescriptor =
    | { type: 'child'; nodeIndex: number; valueIndex: number }
    | {
          type: 'attribute'
          nodeIndex: number
          name: string
          pieces: Array<string | number>
      }
    | { type: 'event'; nodeIndex: number; name: string; valueIndex: number }
    | { type: 'ref'; nodeIndex: number; valueIndex: number }

interface Definition {
    template: HTMLTemplateElement
    parts: PartDescriptor[]
}

const registry = new WeakMap<TemplateStringsArray, Definition>()
const TOKEN_PREFIX = '__BFS_V2_'
const TOKEN_RE = /__BFS_V2_(\d+)__/g

const exactToken = (value: string) => {
    const match = /^__BFS_V2_(\d+)__$/.exec(value)
    return match ? Number(match[1]) : null
}

const splitPieces = (value: string): Array<string | number> => {
    const pieces: Array<string | number> = []
    let last = 0
    TOKEN_RE.lastIndex = 0
    for (let match = TOKEN_RE.exec(value); match; match = TOKEN_RE.exec(value)) {
        if (match.index > last) pieces.push(value.slice(last, match.index))
        pieces.push(Number(match[1]))
        last = match.index + match[0].length
    }
    if (last < value.length) pieces.push(value.slice(last))
    return pieces
}

function compile(parts: TemplateStringsArray | string[]): Definition {
    const tagged = Object.prototype.hasOwnProperty.call(parts, 'raw')
        ? (parts as TemplateStringsArray)
        : null
    if (tagged) {
        const cached = registry.get(tagged)
        if (cached) return cached
    }

    let markup = parts[0] ?? ''
    for (let i = 1; i < parts.length; i++) {
        markup += `${TOKEN_PREFIX}${i - 1}__${parts[i]}`
    }

    const template = document.createElement('template')
    template.innerHTML = markup.trim()

    const textNodes: Text[] = []
    const collectText = document.createTreeWalker(
        template.content,
        NodeFilter.SHOW_TEXT
    )
    while (collectText.nextNode()) {
        const text = collectText.currentNode as Text
        if (text.data.includes(TOKEN_PREFIX)) textNodes.push(text)
    }

    for (const text of textNodes) {
        const pieces = splitPieces(text.data)
        const frag = document.createDocumentFragment()
        for (const piece of pieces) {
            if (typeof piece === 'number') {
                frag.append(document.createComment(`bfs:${piece}`))
            } else if (piece) {
                frag.append(document.createTextNode(piece))
            }
        }
        text.replaceWith(frag)
    }

    const partsOut: PartDescriptor[] = []
    const walker = document.createTreeWalker(
        template.content,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT
    )
    let nodeIndex = -1
    while (walker.nextNode()) {
        nodeIndex++
        const node = walker.currentNode
        if (node instanceof Comment && node.data.startsWith('bfs:')) {
            partsOut.push({
                type: 'child',
                nodeIndex,
                valueIndex: Number(node.data.slice(4)),
            })
            continue
        }
        if (!(node instanceof Element)) continue

        for (const attr of Array.from(node.attributes)) {
            if (!attr.value.includes(TOKEN_PREFIX)) continue
            const exact = exactToken(attr.value)
            if (attr.name === 'ref' && exact !== null) {
                partsOut.push({ type: 'ref', nodeIndex, valueIndex: exact })
                node.removeAttribute(attr.name)
            } else if (attr.name.startsWith('on') && exact !== null) {
                partsOut.push({
                    type: 'event',
                    nodeIndex,
                    name: attr.name.slice(2),
                    valueIndex: exact,
                })
                node.removeAttribute(attr.name)
            } else {
                partsOut.push({
                    type: 'attribute',
                    nodeIndex,
                    name: attr.name,
                    pieces: splitPieces(attr.value),
                })
                node.removeAttribute(attr.name)
            }
        }
    }

    const definition = { template, parts: partsOut }
    if (tagged) registry.set(tagged, definition)
    return definition
}

const attrValue = (pieces: Array<string | number>, values: unknown[]) => {
    if (pieces.length === 1 && typeof pieces[0] === 'number') {
        const value = values[pieces[0]]
        return value == null ? '' : String(value)
    }
    let result = ''
    for (const piece of pieces) {
        result += typeof piece === 'number' ? String(values[piece] ?? '') : piece
    }
    return result
}

interface ChildBinding {
    type: 'child'
    start: Text
    end: Text
    valueIndex: number
    current: unknown
    children: HtmlV2[]
}

type Binding =
    | ChildBinding
    | {
          type: 'attribute'
          node: Element
          name: string
          pieces: Array<string | number>
          current: string
      }
    | {
          type: 'event'
          node: Element
          name: string
          valueIndex: number
          current: EventListener
      }

const isPrimitive = (value: unknown) =>
    value == null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'

const flattenOne = (value: unknown): unknown[] =>
    Array.isArray(value) ? value : [value]

class HtmlV2 {
    #definition: Definition
    #parts: TemplateStringsArray | string[]
    #values: unknown[]
    #bindings: Binding[] = []
    #markers = [document.createTextNode(''), document.createTextNode('')]
    #mounted = false
    #refs: Record<string, Set<Element>> = {}
    #mountSub: LifecycleCallback | undefined
    #moveSub: LifecycleCallback | undefined
    #updateSub: LifecycleCallback | undefined
    #unmountSub: (() => void) | undefined
    __PARENT__: HtmlV2 | null = null
    __CHILDREN__: Set<HtmlV2> = new Set()

    constructor(parts: TemplateStringsArray | string[], values: unknown[]) {
        this.#parts = parts
        this.#values = values
        this.#definition = compile(parts)
    }

    get mounted() {
        return this.#mounted
    }

    get parentNode() {
        return this.#markers[0].parentNode
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
            for (const [name, elements] of Object.entries(refs)) {
                const set = collected[name] ?? (collected[name] = new Set())
                for (const element of elements) set.add(element)
            }
        }
        add(this.#refs)
        for (const child of this.__CHILDREN__) add(child.refs)

        return Object.fromEntries(
            Object.entries(collected).map(([name, elements]) => [
                name,
                Array.from(elements),
            ])
        )
    }

    onMount(cb: LifecycleCallback) {
        this.#mountSub = cb
        return this
    }

    onMove(cb: LifecycleCallback) {
        this.#moveSub = cb
        return this
    }

    onUpdate(cb: LifecycleCallback) {
        this.#updateSub = cb
        return this
    }

    #clearChild(binding: ChildBinding) {
        for (const child of binding.children) {
            child.unmount()
            this.__CHILDREN__.delete(child)
        }
        binding.children = []

        let node = binding.start.nextSibling
        while (node && node !== binding.end) {
            const next = node.nextSibling
            node.remove()
            node = next
        }
    }

    #appendChildValue(binding: ChildBinding, value: unknown) {
        const parent = binding.end.parentNode
        if (!parent || value == null || value === false) return

        if (value instanceof HtmlV2) {
            const frag = document.createDocumentFragment()
            value.render(frag)
            value.__PARENT__ = this
            this.__CHILDREN__.add(value)
            binding.children.push(value)
            parent.insertBefore(frag, binding.end)
            return
        }

        if (value instanceof Node) {
            parent.insertBefore(value, binding.end)
            return
        }

        if (Array.isArray(value)) {
            for (const item of value) this.#appendChildValue(binding, item)
            return
        }

        parent.insertBefore(document.createTextNode(String(value)), binding.end)
    }

    #commitChild(binding: ChildBinding, value: unknown, init = false) {
        if (!init && isPrimitive(value) && isPrimitive(binding.current)) {
            const only =
                binding.start.nextSibling !== binding.end &&
                binding.start.nextSibling?.nextSibling === binding.end
                    ? binding.start.nextSibling
                    : null
            if (only instanceof Text) {
                const next = value == null || value === false ? '' : String(value)
                if (only.data !== next) only.data = next
                binding.current = value
                return
            }
        }

        this.#clearChild(binding)
        for (const item of flattenOne(value)) this.#appendChildValue(binding, item)
        binding.current = value
    }

    render(target: Element | DocumentFragment | ShadowRoot) {
        if (this.#mounted) {
            if (target !== this.parentNode) {
                target.append(
                    this.#markers[0],
                    ...this.childNodes,
                    this.#markers[1]
                )
                if (!(target instanceof DocumentFragment)) this.#moveSub?.(this)
            }
            return this
        }

        const frag = this.#definition.template.content.cloneNode(
            true
        ) as DocumentFragment
        const nodes: Node[] = []
        const walker = document.createTreeWalker(
            frag,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT
        )
        while (walker.nextNode()) nodes.push(walker.currentNode)

        for (const descriptor of this.#definition.parts) {
            const node = nodes[descriptor.nodeIndex]
            if (descriptor.type === 'child') {
                const start = document.createTextNode('')
                const end = document.createTextNode('')
                node.parentNode?.insertBefore(start, node)
                node.parentNode?.insertBefore(end, node)
                node.remove()
                const binding: ChildBinding = {
                    type: 'child',
                    start,
                    end,
                    valueIndex: descriptor.valueIndex,
                    current: undefined,
                    children: [],
                }
                this.#bindings.push(binding)
                this.#commitChild(binding, this.#values[descriptor.valueIndex], true)
            } else if (descriptor.type === 'attribute') {
                const element = node as Element
                const value = attrValue(descriptor.pieces, this.#values)
                element.setAttribute(descriptor.name, value)
                this.#bindings.push({
                    type: 'attribute',
                    node: element,
                    name: descriptor.name,
                    pieces: descriptor.pieces,
                    current: value,
                })
            } else if (descriptor.type === 'event') {
                const element = node as Element
                const listener = this.#values[descriptor.valueIndex] as EventListener
                element.addEventListener(descriptor.name, listener)
                this.#bindings.push({
                    type: 'event',
                    node: element,
                    name: descriptor.name,
                    valueIndex: descriptor.valueIndex,
                    current: listener,
                })
            } else {
                const element = node as Element
                const name = String(this.#values[descriptor.valueIndex])
                ;(this.#refs[name] ??= new Set()).add(element)
            }
        }

        frag.prepend(this.#markers[0])
        frag.append(this.#markers[1])
        target.append(frag)
        this.#mounted = true
        const cleanup = this.#mountSub?.(this)
        this.#unmountSub = typeof cleanup === 'function' ? cleanup : undefined
        return this
    }

    replace(target: Node | HtmlV2) {
        const element = target instanceof HtmlV2 ? target.#markers[0] : target
        const parent = element.parentNode
        if (!parent) return this

        if (target instanceof HtmlV2) target.unmount()
        const frag = document.createDocumentFragment()
        this.render(frag)
        parent.insertBefore(frag, element)
        if (!(parent instanceof DocumentFragment)) this.#moveSub?.(this)
        element.remove()
        return this
    }

    insertAfter(target: Node | HtmlV2) {
        const node = target instanceof HtmlV2 ? target.#markers[1] : target
        const parent = node.parentNode
        if (!parent) return this
        const frag = document.createDocumentFragment()
        this.render(frag)
        parent.insertBefore(frag, node.nextSibling)
        if (!(parent instanceof DocumentFragment)) this.#moveSub?.(this)
        return this
    }

    __updateFrom(next: HtmlV2) {
        if (!this.#mounted || this.#parts !== next.#parts) return false
        const nextValues = next.#values
        let changed = false

        for (const binding of this.#bindings) {
            if (binding.type === 'child') {
                const value = nextValues[binding.valueIndex]
                if (!Object.is(value, binding.current)) {
                    this.#commitChild(binding, value)
                    changed = true
                }
            } else if (binding.type === 'attribute') {
                const value = attrValue(binding.pieces, nextValues)
                if (value !== binding.current) {
                    binding.node.setAttribute(binding.name, value)
                    binding.current = value
                    changed = true
                }
            } else {
                const listener = nextValues[binding.valueIndex] as EventListener
                if (listener !== binding.current) {
                    binding.node.removeEventListener(binding.name, binding.current)
                    binding.node.addEventListener(binding.name, listener)
                    binding.current = listener
                    changed = true
                }
            }
        }

        this.#values = nextValues
        if (changed) this.#updateSub?.(this)
        return true
    }

    unmount() {
        if (!this.#mounted) return this

        for (const binding of this.#bindings) {
            if (binding.type === 'event') {
                binding.node.removeEventListener(binding.name, binding.current)
            } else if (binding.type === 'child') {
                this.#clearChild(binding)
            }
        }

        let node: Node | null = this.#markers[0]
        while (node) {
            const next = node.nextSibling
            node.remove()
            if (node === this.#markers[1]) break
            node = next
        }

        this.#unmountSub?.()
        this.__PARENT__?.__CHILDREN__.delete(this)
        this.__PARENT__ = null
        this.__CHILDREN__.clear()
        this.#refs = {}
        this.#bindings = []
        this.#mounted = false
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
        const value = this.childNodes
            .map((node) =>
                node instanceof Element ? node.outerHTML : node.nodeValue
            )
            .join('')
        this.unmount()
        return value
    }
}

const htmlV2 = (parts: TemplateStringsArray | string[], ...values: unknown[]) =>
    new HtmlV2(parts, values)

const noop = () => {}
const minimalCurrent = (id: number, name: string) =>
    currentHtml`<span data-id="${id}">${name}</span>`
const minimalV2 = (id: number, name: string) =>
    htmlV2`<span data-id="${id}">${name}</span>`
const moderateCurrent = (id: number, name: string) => currentHtml`
    <div class="card" data-id="${id}">
        <button onclick="${noop}">Action</button>
        <strong>${name}</strong>
        <span>${id}</span>
    </div>
`
const moderateV2 = (id: number, name: string) => htmlV2`
    <div class="card" data-id="${id}">
        <button onclick="${noop}">Action</button>
        <strong>${name}</strong>
        <span>${id}</span>
    </div>
`
const fsCurrent = (id: number, name: string) => currentHtml`
    <article class="business-asset-card" data-id="${id}">
        <div class="icon-area"><span class="icon">📁</span></div>
        <div class="card-details">
            <h3 class="title">${name}</h3>
            <p class="description">Description for item ${id}</p>
            <div class="badges"><span class="badge warning">Draft</span><span class="badge info">Asset</span></div>
            <div class="metadata"><span>Size:</span><span>2.4 MB</span><span>Updated:</span><span>2 hours ago</span></div>
            <button class="action-trigger" onclick="${noop}">Actions</button>
        </div>
    </article>
`
const fsV2 = (id: number, name: string) => htmlV2`
    <article class="business-asset-card" data-id="${id}">
        <div class="icon-area"><span class="icon">📁</span></div>
        <div class="card-details">
            <h3 class="title">${name}</h3>
            <p class="description">Description for item ${id}</p>
            <div class="badges"><span class="badge warning">Draft</span><span class="badge info">Asset</span></div>
            <div class="metadata"><span>Size:</span><span>2.4 MB</span><span>Updated:</span><span>2 hours ago</span></div>
            <button class="action-trigger" onclick="${noop}">Actions</button>
        </div>
    </article>
`

const richCurrent = (id: number, name: string) => currentHtml`
    <section ref="row-${id}" data-id="${id}">
        <h3>${name}</h3>
        ${[
            currentHtml`<span ref="nested">${id}</span>`,
            ' · ',
            currentHtml`<em>${name}</em>`,
        ]}
    </section>
`
const richV2 = (id: number, name: string) => htmlV2`
    <section ref="${`row-${id}`}" data-id="${id}">
        <h3>${name}</h3>
        ${[
            htmlV2`<span ref="${'nested'}">${id}</span>`,
            ' · ',
            htmlV2`<em>${name}</em>`,
        ]}
    </section>
`

function assertFeatures() {
    const root = document.createElement('div')
    const events: string[] = []
    const child = htmlV2`<span ref="${'child'}">child</span>`
        .onMount(() => {
            events.push('child-mount')
            return () => events.push('child-cleanup')
        })
    const view = htmlV2`<div ref="${'root'}">${['a', child, 'b']}</div>`
        .onMount(() => {
            events.push('mount')
            return () => events.push('cleanup')
        })
        .onUpdate(() => events.push('update'))
        .onMove(() => events.push('move'))

    view.render(root)
    if (root.textContent !== 'achildb') throw new Error('array/nested render failed')
    if (view.refs.root.length !== 1 || view.refs.child.length !== 1) {
        throw new Error('nested refs failed')
    }

    const next = htmlV2`<div ref="${'root'}">${['x', htmlV2`<b>y</b>`, 'z']}</div>`
    if (!view.__updateFrom(next) || root.textContent !== 'xyz') {
        throw new Error('nested/array update failed')
    }

    const moved = document.createElement('div')
    view.render(moved)
    view.unmount()
    if (!events.includes('mount') || !events.includes('update') || !events.includes('move')) {
        throw new Error(`lifecycle failed: ${events.join(',')}`)
    }
}

async function runBench(title: string, setup: (bench: Bench) => void) {
    const bench = new Bench({ time: 80, warmupTime: 30 })
    setup(bench)
    await bench.run()
    console.log(`\n===== ${title} =====`)
    for (const task of bench.tasks) {
        console.log(
            `${task.name}: ${Math.round(task.result?.hz ?? 0).toLocaleString()} ops/sec`
        )
    }
}

async function run() {
    assertFeatures()
    minimalCurrent(0, 'warm')
    minimalV2(0, 'warm')

    await runBench('Template object creation (warm definition)', (bench) => {
        bench.add('current html()', () => minimalCurrent(1, 'item-1'))
        bench.add('v2 html()', () => minimalV2(1, 'item-1'))
    })

    for (const size of [20, 250]) {
        for (const [label, currentFactory, v2Factory] of [
            ['minimal', minimalCurrent, minimalV2],
            ['moderate', moderateCurrent, moderateV2],
            ['FS-like', fsCurrent, fsV2],
            ['nested+refs+arrays', richCurrent, richV2],
        ] as const) {
            await runBench(`Initial mount ${label} x${size}`, (bench) => {
                bench.add('current', () => {
                    const root = document.createElement('div')
                    const templates: CurrentHtmlTemplate[] = []
                    for (let i = 0; i < size; i++) {
                        const t = currentFactory(i, `item-${i}`)
                        templates.push(t)
                        t.render(root)
                    }
                    for (const t of templates) t.unmount()
                })
                bench.add('v2', () => {
                    const root = document.createElement('div')
                    const templates: HtmlV2[] = []
                    for (let i = 0; i < size; i++) {
                        const t = v2Factory(i, `item-${i}`)
                        templates.push(t)
                        t.render(root)
                    }
                    for (const t of templates) t.unmount()
                })
            })
        }

        const currentRoot = document.createElement('div')
        const currentRows = Array.from({ length: size }, (_, i) =>
            fsCurrent(i, `item-${i}`).render(currentRoot)
        )
        const v2Root = document.createElement('div')
        const v2Rows = Array.from({ length: size }, (_, i) =>
            fsV2(i, `item-${i}`).render(v2Root)
        )

        await runBench(`Same-shape immutable update ceiling x${size}`, (bench) => {
            let generation = 0
            bench.add('current replace', () => {
                generation++
                for (let i = 0; i < size; i++) {
                    const next = fsCurrent(i, `item-${i}-${generation}`)
                    next.replace(currentRows[i])
                    currentRows[i] = next
                }
            })
            bench.add('v2 part update', () => {
                generation++
                for (let i = 0; i < size; i++) {
                    v2Rows[i].__updateFrom(fsV2(i, `item-${i}-${generation}`))
                }
            })
        })

        for (const row of currentRows) row.unmount()
        for (const row of v2Rows) row.unmount()
    }
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
