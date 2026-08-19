import 'global-jsdom/register'
import { Bench } from 'tinybench'
import { DoubleLinkedList } from '../src/DoubleLinkedList.ts'
import { HtmlTemplate, html } from '../src/html.ts'
import { syncNodes } from '../src/utils/sync-nodes.ts'
import { insertNodeAfter } from '../src/utils/insert-node-after.ts'

const SIZES = [20, 60, 250, 1000]

type Item = Node | HtmlTemplate

type Mode = 'templates' | 'mixed'

function removeItem(item: Item) {
    if (item instanceof HtmlTemplate) item.unmount()
    else item.parentNode?.removeChild(item)
}

function renderIntoFragment(item: Item, frag: DocumentFragment, owner: HtmlTemplate) {
    if (item instanceof HtmlTemplate) {
        item.render(frag)
        item.__PARENT__ = owner
        owner.__CHILDREN__.add(item)
    } else {
        frag.appendChild(item)
    }
}

function hasOverlap(current: DoubleLinkedList<Item>, desired: Item[]) {
    const desiredSet = new Set(desired)
    for (const item of current) {
        if (desiredSet.has(item)) return true
    }
    return false
}

/**
 * Candidate optimization: only handle completely disjoint replacement sets.
 * All other cases fall back to the production reconciler.
 *
 * For disjoint sets, preserve current lifecycle ordering by rendering each new
 * item before unmounting/removing the old item at the same position, but keep
 * new DOM detached in one DocumentFragment until the final insertion.
 */
function syncNodesFastPath(
    current: DoubleLinkedList<Item>,
    desired: Item[],
    anchor: Node,
    owner: HtmlTemplate
) {
    if (!current.size || !desired.length || hasOverlap(current, desired)) {
        return syncNodes(current, desired, anchor, owner)
    }

    const old = Array.from(current)
    const frag = document.createDocumentFragment()
    const next = new DoubleLinkedList<Item>()
    const length = Math.max(old.length, desired.length)

    for (let i = 0; i < length; i++) {
        const newItem = desired[i]
        const oldItem = old[i]

        if (newItem) {
            renderIntoFragment(newItem, frag, owner)
            next.push(newItem)
        }

        if (oldItem) removeItem(oldItem)
    }

    current.clear()
    for (const item of next) current.push(item)
    insertNodeAfter(frag, anchor)
    return current
}

function createTemplate(id: number, events?: string[]) {
    return html`<span>${id}</span>`
        .onMount(() => {
            events?.push(`mount:${id}`)
            return () => events?.push(`unmount:${id}`)
        })
}

function createNode(id: number) {
    const node = document.createElement('span')
    node.textContent = String(id)
    return node
}

function createItems(size: number, offset: number, mode: Mode, events?: string[]): Item[] {
    return Array.from({ length: size }, (_, i) => {
        const id = offset + i
        if (mode === 'mixed' && i % 2 === 1) return createNode(id)
        return createTemplate(id, events)
    })
}

function setup(size: number, mode: Mode, events?: string[]) {
    const parent = document.createElement('div')
    const anchor = document.createTextNode('')
    const owner = html``
    parent.appendChild(anchor)
    const current = createItems(size, 0, mode, events)

    for (const item of current) {
        if (item instanceof HtmlTemplate) {
            item.render(parent)
            item.__PARENT__ = owner
            owner.__CHILDREN__.add(item)
        } else {
            parent.appendChild(item)
        }
    }

    return { parent, anchor, owner, current }
}

function visibleItems(parent: Element) {
    return Array.from(parent.children).map((el) => el.textContent)
}

function correctness(mode: Mode) {
    const expectedEvents: string[] = []
    const candidateEvents: string[] = []

    const a = setup(5, mode, expectedEvents)
    expectedEvents.length = 0
    const aDesired = createItems(5, 100, mode, expectedEvents)
    syncNodes(DoubleLinkedList.fromArray(a.current), aDesired, a.anchor, a.owner)

    const b = setup(5, mode, candidateEvents)
    candidateEvents.length = 0
    const bDesired = createItems(5, 100, mode, candidateEvents)
    syncNodesFastPath(DoubleLinkedList.fromArray(b.current), bDesired, b.anchor, b.owner)

    const expectedDOM = visibleItems(a.parent)
    const candidateDOM = visibleItems(b.parent)

    if (JSON.stringify(candidateDOM) !== JSON.stringify(expectedDOM)) {
        throw new Error(`${mode}: candidate DOM differs from current`)
    }

    if (JSON.stringify(candidateEvents) !== JSON.stringify(expectedEvents)) {
        throw new Error(
            `${mode}: lifecycle order differs\ncurrent=${JSON.stringify(expectedEvents)}\ncandidate=${JSON.stringify(candidateEvents)}`
        )
    }

    const expectedMounted = aDesired.filter((x) => x instanceof HtmlTemplate).every((x) => (x as HtmlTemplate).mounted)
    const candidateMounted = bDesired.filter((x) => x instanceof HtmlTemplate).every((x) => (x as HtmlTemplate).mounted)
    if (!expectedMounted || !candidateMounted) throw new Error(`${mode}: new templates not mounted`)

    const candidateOldUnmounted = b.current
        .filter((x) => x instanceof HtmlTemplate)
        .every((x) => !(x as HtmlTemplate).mounted)
    if (!candidateOldUnmounted) throw new Error(`${mode}: old templates still mounted`)

    console.log(`${mode} correctness + lifecycle order: PASS`)
}

async function benchmark(size: number, mode: Mode) {
    const bench = new Bench({ time: 200, warmupTime: 100 })

    bench.add(`current:${mode}:${size}`, () => {
        const { parent, anchor, owner, current } = setup(size, mode)
        const desired = createItems(size, size, mode)
        syncNodes(DoubleLinkedList.fromArray(current), desired, anchor, owner)
        if (parent.children.length !== size) throw new Error('current length mismatch')
    })

    bench.add(`fast-path:${mode}:${size}`, () => {
        const { parent, anchor, owner, current } = setup(size, mode)
        const desired = createItems(size, size, mode)
        syncNodesFastPath(DoubleLinkedList.fromArray(current), desired, anchor, owner)
        if (parent.children.length !== size) throw new Error('candidate length mismatch')
    })

    await bench.run()

    console.log(`\n--- full replacement / ${mode} / size ${size} ---`)
    console.table(
        bench.tasks.map((task) => ({
            name: task.name,
            hz: Math.round(task.result?.hz ?? 0),
            meanMs: Number(((task.result?.mean ?? 0) * 1000).toFixed(4)),
        }))
    )
}

async function run() {
    correctness('templates')
    correctness('mixed')

    for (const size of SIZES) {
        await benchmark(size, 'templates')
        await benchmark(size, 'mixed')
    }
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
