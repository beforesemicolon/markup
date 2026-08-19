import 'global-jsdom/register'
import { Bench } from 'tinybench'
import { DoubleLinkedList } from '../src/DoubleLinkedList.ts'
import { syncNodes } from '../src/utils/sync-nodes.ts'
import { html } from '../src/html.ts'

const SIZES = [20, 60, 250, 1000]

type Scenario = {
    name: string
    next: (nodes: HTMLElement[]) => HTMLElement[]
}

const scenarios: Scenario[] = [
    { name: 'noop', next: (nodes) => [...nodes] },
    { name: 'append', next: (nodes) => [...nodes, createNode(nodes.length)] },
    { name: 'prepend', next: (nodes) => [createNode(-1), ...nodes] },
    {
        name: 'remove-middle',
        next: (nodes) => nodes.filter((_, i) => i !== Math.floor(nodes.length / 2)),
    },
    { name: 'reverse', next: (nodes) => [...nodes].reverse() },
    {
        name: 'rotate',
        next: (nodes) => (nodes.length ? [...nodes.slice(1), nodes[0]] : nodes),
    },
    {
        name: 'replace-all',
        next: (nodes) => nodes.map((_, i) => createNode(i + nodes.length)),
    },
]

function createNode(id: number) {
    const node = document.createElement('span')
    node.textContent = String(id)
    return node
}

function setup(size: number) {
    const parent = document.createElement('div')
    const anchor = document.createTextNode('')
    const nodes = Array.from({ length: size }, (_, i) => createNode(i))
    parent.append(anchor, ...nodes)
    return { parent, anchor, nodes }
}

/**
 * Prototype: Set membership + one left-to-right native DOM placement pass.
 * It intentionally has no linked-list bookkeeping so we can measure whether
 * that bookkeeping is where the current reconciler is paying its cost.
 */
function syncNodesCandidate(current: Node[], desired: Node[], anchor: Node) {
    const desiredSet = new Set(desired)

    for (const node of current) {
        if (!desiredSet.has(node)) node.parentNode?.removeChild(node)
    }

    let previous = anchor
    for (const node of desired) {
        if (previous.nextSibling !== node) {
            previous.parentNode?.insertBefore(node, previous.nextSibling)
        }
        previous = node
    }

    return desired
}

/**
 * Vanilla lower bound: same DOM semantics, deliberately minimal bookkeeping.
 * This is intentionally identical in DOM operations to the candidate for the
 * Node-only benchmark; any remaining gap to Markup is reconciler bookkeeping.
 */
function syncVanilla(current: Node[], desired: Node[], anchor: Node) {
    const desiredSet = new Set(desired)

    for (const node of current) {
        if (!desiredSet.has(node)) node.remove()
    }

    let previous = anchor
    for (const node of desired) {
        if (previous.nextSibling !== node) {
            previous.parentNode?.insertBefore(node, previous.nextSibling)
        }
        previous = node
    }

    return desired
}

function assertOrder(parent: Element, expected: Node[]) {
    const actual = Array.from(parent.childNodes).slice(1)
    if (
        actual.length !== expected.length ||
        actual.some((node, i) => node !== expected[i])
    ) {
        throw new Error('reconciliation produced incorrect DOM order')
    }
}

async function benchmarkScenario(size: number, scenario: Scenario) {
    const bench = new Bench({ time: 150, warmupTime: 75 })

    bench.add(`current:${scenario.name}:${size}`, () => {
        const { parent, anchor, nodes } = setup(size)
        const desired = scenario.next(nodes)
        const owner = html``
        syncNodes(DoubleLinkedList.fromArray(nodes), desired, anchor, owner)
        assertOrder(parent, desired)
    })

    bench.add(`candidate:${scenario.name}:${size}`, () => {
        const { parent, anchor, nodes } = setup(size)
        const desired = scenario.next(nodes)
        syncNodesCandidate(nodes, desired, anchor)
        assertOrder(parent, desired)
    })

    bench.add(`vanilla:${scenario.name}:${size}`, () => {
        const { parent, anchor, nodes } = setup(size)
        const desired = scenario.next(nodes)
        syncVanilla(nodes, desired, anchor)
        assertOrder(parent, desired)
    })

    await bench.run()

    console.log(`\n--- ${scenario.name} / size ${size} ---`)
    console.table(
        bench.tasks.map((task) => ({
            name: task.name,
            hz: Math.round(task.result?.hz ?? 0),
            meanMs: Number(((task.result?.mean ?? 0) * 1000).toFixed(4)),
        }))
    )
}

function correctnessSmoke() {
    for (const size of [0, 1, 5, 20]) {
        for (const scenario of scenarios) {
            const { parent, anchor, nodes } = setup(size)
            const desired = scenario.next(nodes)
            syncNodesCandidate(nodes, desired, anchor)
            assertOrder(parent, desired)
        }
    }
    console.log('candidate correctness smoke: PASS')
}

async function run() {
    correctnessSmoke()

    for (const size of SIZES) {
        for (const scenario of scenarios) {
            await benchmarkScenario(size, scenario)
        }
    }
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
