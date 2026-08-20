import 'global-jsdom/register'
import { Bench } from 'tinybench'
import { html as currentHtml, HtmlTemplate as CurrentHtmlTemplate } from '../src/html.ts'

type PartDescriptor =
    | { type: 'child'; nodeIndex: number; valueIndex: number }
    | { type: 'attribute'; nodeIndex: number; name: string; pieces: Array<string | number> }
    | { type: 'event'; nodeIndex: number; name: string; valueIndex: number }

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
    const collectText = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT)
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
            if (attr.name.startsWith('on') && exact !== null) {
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

type Binding =
    | { type: 'child'; node: Text; valueIndex: number; current: unknown }
    | { type: 'attribute'; node: Element; name: string; pieces: Array<string | number>; current: string }
    | { type: 'event'; node: Element; name: string; valueIndex: number; current: EventListener }

class HtmlV2 {
    #definition: Definition
    #parts: TemplateStringsArray | string[]
    #values: unknown[]
    #bindings: Binding[] = []
    #markers = [document.createTextNode(''), document.createTextNode('')]
    #mounted = false

    constructor(parts: TemplateStringsArray | string[], values: unknown[]) {
        this.#parts = parts
        this.#values = values
        this.#definition = compile(parts)
    }

    get mounted() {
        return this.#mounted
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

    render(target: Element | DocumentFragment | ShadowRoot) {
        if (this.#mounted) {
            target.append(this.#markers[0], ...this.childNodes, this.#markers[1])
            return this
        }

        const frag = this.#definition.template.content.cloneNode(true) as DocumentFragment
        const nodes: Node[] = []
        const walker = document.createTreeWalker(
            frag,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT
        )
        while (walker.nextNode()) nodes.push(walker.currentNode)

        for (const descriptor of this.#definition.parts) {
            const node = nodes[descriptor.nodeIndex]
            if (descriptor.type === 'child') {
                const value = this.#values[descriptor.valueIndex]
                const text = document.createTextNode(value == null ? '' : String(value))
                node.parentNode?.insertBefore(text, node)
                node.remove()
                this.#bindings.push({
                    type: 'child',
                    node: text,
                    valueIndex: descriptor.valueIndex,
                    current: value,
                })
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
            } else {
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
            }
        }

        frag.prepend(this.#markers[0])
        frag.append(this.#markers[1])
        target.append(frag)
        this.#mounted = true
        return this
    }

    __updateFrom(next: HtmlV2) {
        if (!this.#mounted || this.#parts !== next.#parts) return false
        const nextValues = next.#values
        for (const binding of this.#bindings) {
            if (binding.type === 'child') {
                const value = nextValues[binding.valueIndex]
                if (!Object.is(value, binding.current)) {
                    binding.node.data = value == null ? '' : String(value)
                    binding.current = value
                }
            } else if (binding.type === 'attribute') {
                const value = attrValue(binding.pieces, nextValues)
                if (value !== binding.current) {
                    binding.node.setAttribute(binding.name, value)
                    binding.current = value
                }
            } else {
                const listener = nextValues[binding.valueIndex] as EventListener
                if (listener !== binding.current) {
                    binding.node.removeEventListener(binding.name, binding.current)
                    binding.node.addEventListener(binding.name, listener)
                    binding.current = listener
                }
            }
        }
        this.#values = nextValues
        return true
    }

    unmount() {
        if (!this.#mounted) return this
        for (const binding of this.#bindings) {
            if (binding.type === 'event') {
                binding.node.removeEventListener(binding.name, binding.current)
            }
        }
        let node: Node | null = this.#markers[0]
        while (node) {
            const next = node.nextSibling
            node.remove()
            if (node === this.#markers[1]) break
            node = next
        }
        this.#bindings = []
        this.#mounted = false
        return this
    }
}

const htmlV2 = (parts: TemplateStringsArray | string[], ...values: unknown[]) =>
    new HtmlV2(parts, values)

const noop = () => {}
const minimalCurrent = (id: number, name: string) => currentHtml`<span data-id="${id}">${name}</span>`
const minimalV2 = (id: number, name: string) => htmlV2`<span data-id="${id}">${name}</span>`
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

function vanillaFs(id: number, name: string) {
    const article = document.createElement('article')
    article.className = 'business-asset-card'
    article.dataset.id = String(id)
    article.innerHTML = `<div class="icon-area"><span class="icon">📁</span></div><div class="card-details"><h3 class="title"></h3><p class="description"></p><div class="badges"><span class="badge warning">Draft</span><span class="badge info">Asset</span></div><div class="metadata"><span>Size:</span><span>2.4 MB</span><span>Updated:</span><span>2 hours ago</span></div><button class="action-trigger">Actions</button></div>`
    ;(article.querySelector('.title') as HTMLElement).textContent = name
    ;(article.querySelector('.description') as HTMLElement).textContent = `Description for item ${id}`
    article.querySelector('button')!.addEventListener('click', noop)
    return article
}

async function runBench(title: string, setup: (bench: Bench) => void) {
    const bench = new Bench({ time: 80, warmupTime: 30 })
    setup(bench)
    await bench.run()
    console.log(`\n===== ${title} =====`)
    for (const task of bench.tasks) {
        console.log(`${task.name}: ${Math.round(task.result?.hz ?? 0).toLocaleString()} ops/sec`)
    }
}

async function run() {
    // Warm compile the tagged callsites before measuring constructor-only cost.
    minimalCurrent(0, 'warm')
    minimalV2(0, 'warm')

    await runBench('Template object creation (warm definition)', (bench) => {
        bench.add('current html()', () => minimalCurrent(1, 'item-1'))
        bench.add('v2 html()', () => minimalV2(1, 'item-1'))
    })

    for (const size of [20, 250, 1000]) {
        await runBench(`Initial mount minimal x${size}`, (bench) => {
            bench.add('current', () => {
                const root = document.createElement('div')
                const templates: CurrentHtmlTemplate[] = []
                for (let i = 0; i < size; i++) {
                    const t = minimalCurrent(i, `item-${i}`)
                    templates.push(t)
                    t.render(root)
                }
                for (const t of templates) t.unmount()
            })
            bench.add('v2', () => {
                const root = document.createElement('div')
                const templates: HtmlV2[] = []
                for (let i = 0; i < size; i++) {
                    const t = minimalV2(i, `item-${i}`)
                    templates.push(t)
                    t.render(root)
                }
                for (const t of templates) t.unmount()
            })
        })

        await runBench(`Initial mount moderate x${size}`, (bench) => {
            bench.add('current', () => {
                const root = document.createElement('div')
                const templates: CurrentHtmlTemplate[] = []
                for (let i = 0; i < size; i++) {
                    const t = moderateCurrent(i, `item-${i}`)
                    templates.push(t)
                    t.render(root)
                }
                for (const t of templates) t.unmount()
            })
            bench.add('v2', () => {
                const root = document.createElement('div')
                const templates: HtmlV2[] = []
                for (let i = 0; i < size; i++) {
                    const t = moderateV2(i, `item-${i}`)
                    templates.push(t)
                    t.render(root)
                }
                for (const t of templates) t.unmount()
            })
        })

        await runBench(`Initial mount FS-like x${size}`, (bench) => {
            bench.add('current', () => {
                const root = document.createElement('div')
                const templates: CurrentHtmlTemplate[] = []
                for (let i = 0; i < size; i++) {
                    const t = fsCurrent(i, `item-${i}`)
                    templates.push(t)
                    t.render(root)
                }
                for (const t of templates) t.unmount()
            })
            bench.add('v2', () => {
                const root = document.createElement('div')
                const templates: HtmlV2[] = []
                for (let i = 0; i < size; i++) {
                    const t = fsV2(i, `item-${i}`)
                    templates.push(t)
                    t.render(root)
                }
                for (const t of templates) t.unmount()
            })
            bench.add('vanilla', () => {
                const root = document.createElement('div')
                for (let i = 0; i < size; i++) root.append(vanillaFs(i, `item-${i}`))
                root.replaceChildren()
            })
        })

        const currentRoot = document.createElement('div')
        const currentRows = Array.from({ length: size }, (_, i) => fsCurrent(i, `item-${i}`).render(currentRoot))
        const v2Root = document.createElement('div')
        const v2Rows = Array.from({ length: size }, (_, i) => fsV2(i, `item-${i}`).render(v2Root))

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
