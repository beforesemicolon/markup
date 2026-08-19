import 'global-jsdom/register'
import { Bench } from 'tinybench'
import { html, repeat, state } from '../src/index.ts'

type Item = { id: number; name: string; active: boolean }

const SIZES = [20, 60, 250, 1000]
const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve))

class ProtoTemplate {
    readonly shape = 'row-v1'
    readonly values: [string, boolean]
    #node?: HTMLSpanElement

    constructor(item: Item) {
        this.values = [item.name, item.active]
    }

    mount(parent: Element) {
        const node = document.createElement('span')
        this.#node = node
        this.apply(this.values)
        parent.appendChild(node)
        return this
    }

    rebind(next: ProtoTemplate) {
        if (next.shape !== this.shape || !this.#node) return false
        this.apply(next.values)
        return true
    }

    get node() {
        return this.#node
    }

    private apply([name, active]: [string, boolean]) {
        if (!this.#node) return
        if (this.#node.textContent !== name) this.#node.textContent = name
        const className = active ? 'active' : ''
        if (this.#node.className !== className) this.#node.className = className
    }
}

function createItems(size: number): Item[] {
    return Array.from({ length: size }, (_, i) => ({
        id: i,
        name: `item-${i}`,
        active: i % 2 === 0,
    }))
}

function nextItems(items: Item[]) {
    return items.map((item, i) => ({
        ...item,
        name: i % 4 === 0 ? `${item.name}!` : item.name,
        active: i % 5 === 0 ? !item.active : item.active,
    }))
}

function protoRepeat(
    data: () => Item[],
    renderer: (item: Item, index: number) => ProtoTemplate,
    key: (item: Item, index: number) => unknown,
    parent: Element
) {
    let previous = new Map<unknown, { item: Item; rendered: ProtoTemplate }>()

    return () => {
        const list = data()
        const next = new Map<unknown, { item: Item; rendered: ProtoTemplate }>()
        const order: Node[] = []

        for (let i = 0; i < list.length; i++) {
            const item = list[i]
            const k = key(item, i)
            const prev = previous.get(k)
            const candidate = renderer(item, i)
            let rendered = candidate

            if (prev && prev.rendered.rebind(candidate)) {
                rendered = prev.rendered
            } else if (!rendered.node) {
                rendered.mount(parent)
            }

            if (rendered.node) order.push(rendered.node)
            next.set(k, { item, rendered })
        }

        const desired = new Set(order)
        for (const child of Array.from(parent.childNodes)) {
            if (!desired.has(child)) child.remove()
        }
        for (const node of order) parent.appendChild(node)

        previous = next
    }
}

async function benchmark(size: number) {
    const initial = createItems(size)

    let currentItems = initial
    const [currentState, setCurrent] = state(currentItems)
    const currentContainer = document.createElement('div')
    const currentTemplate = html`${repeat(
        currentState,
        (item: Item) => html`<span class="${item.active ? 'active' : ''}">${item.name}</span>`,
        { key: (item: Item) => item.id }
    )}`
    currentTemplate.render(currentContainer)

    let protoItems = initial
    const protoContainer = document.createElement('div')
    const readProto = () => protoItems
    const updateProto = protoRepeat(
        readProto,
        (item) => new ProtoTemplate(item),
        (item) => item.id,
        protoContainer
    )
    updateProto()

    const bench = new Bench({ time: 150, warmupTime: 75 })

    bench.add(`current:${size}`, async () => {
        currentItems = nextItems(currentItems)
        setCurrent(currentItems)
        await flush()
    })

    bench.add(`prototype:${size}`, () => {
        protoItems = nextItems(protoItems)
        updateProto()
    })

    await bench.run()

    const currentText = Array.from(currentContainer.querySelectorAll('span')).map((n) => [n.textContent, n.className])
    const protoText = Array.from(protoContainer.querySelectorAll('span')).map((n) => [n.textContent, n.className])
    if (JSON.stringify(currentText) !== JSON.stringify(protoText)) {
        throw new Error(`DOM mismatch at size ${size}`)
    }

    console.log(`\n--- keyed immutable DOM update / size ${size} ---`)
    console.table(
        bench.tasks.map((task) => ({
            name: task.name,
            hz: Math.round(task.result?.hz ?? 0),
            meanUs: Number(((task.result?.mean ?? 0) * 1e6).toFixed(2)),
        }))
    )

    currentTemplate.unmount()
}

async function run() {
    for (const size of SIZES) await benchmark(size)
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
