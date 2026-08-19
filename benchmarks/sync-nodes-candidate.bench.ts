import 'global-jsdom/register'
import { Bench } from 'tinybench'
import { DoubleLinkedList } from '../src/DoubleLinkedList.ts'
import { syncNodes } from '../src/utils/sync-nodes.ts'
import { html } from '../src/html.ts'

const SIZES = [20, 60, 250, 1000]
const owner = html``

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
 * Naive prototype from the first experiment. Kept as a control because it
 * shows that "simpler" alone is not sufficient: rotations cause many moves.
 */
function syncNodesNaive(current: Node[], desired: Node[], anchor: Node) {
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

/**
 * Targeted prototype: preserve the current reconciler for overlapping sets,
 * but fast-path a complete identity replacement. Current syncNodes handles
 * rotations very efficiently; its clearest loss is when no old node survives.
 */
function syncNodesWithDisjointFastPath(
    current: DoubleLinkedList<Node>,
    desired: Node[],
    anchor: Node
) {
    if (
        current.size > 0 &&
        desired.length > 0 &&
        !desired.some((node) => current.has(node))
    ) {
        for (const node of current) node.remove()
        current.clear()

        const fragment = document.createDocumentFragment()
        for (const node of desired) {
            fragment.appendChild(node)
            current.push(node)
        }
        anchor.parentNode?.insertBefore(fragment, anchor.nextSibling)
        return current
    }

    return syncNodes(current, desired, anchor, owner)
}

/**
 * Straightforward hand-written DOM comparison. This is not an optimal lower
 * bound for every reorder (notably rotations); it is a minimal generic pass.
 */
function syncVanilla(current: Node[], desired: Node[], anchor: Node) {
    return syncNodesNaive(current, desired, anchor)
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
        syncNodes(DoubleLinkedList.fromArray(nodes), desired, anchor, owner)
        assertOrder(parent, desired)
    })

    bench.add(`fast-path:${scenario.name}:${size}`, () => {
        const { parent, anchor, nodes } = setup(size)
        const desired = scenario.next(nodes)
        syncNodesWithDisjointFastPath(
            DoubleLinkedList.fromArray<Node>(nodes),
            desired,
            anchor
        )
        assertOrder(parent, desired)
    })

    bench.add(`naive:${scenario.name}:${size}`, () => {
        const { parent, anchor, nodes } = setup(size)
        const desired = scenario.next(nodes)
        syncNodesNaive(nodes, desired, anchor)
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
            meanMs: Number((task.result?.mean ?? 0).toFixed(4)),
        }))
    )
}

function correctnessSmoke() {
    for (const size of [0, 1, 5, 20]) {
        for (const scenario of scenarios) {
            {
                const { parent, anchor, nodes } = setup(size)
                const desired = scenario.next(nodes)
                syncNodesNaive(nodes, desired, anchor)
                assertOrder(parent, desired)
            }
            {
                const { parent, anchor, nodes } = setup(size)
                const desired = scenario.next(nodes)
                syncNodesWithDisjointFastPath(
                    DoubleLinkedList.fromArray<Node>(nodes),
                    desired,
                    anchor
                )
                assertOrder(parent, desired)
            }
        }
    }
    console.log('prototype correctness smoke: PASS')
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
