import assert from 'node:assert/strict'
import { Bench, type BenchOptions } from 'tinybench'
import { html, repeat, state } from '../../src/index.ts'
import { generateItems, type StableItem } from './fixtures.ts'
import {
    assertRows,
    assertUpdate,
    expectedRenderCalls,
    flushRenderQueue,
    getRows,
    prepareUpdate,
    type BenchmarkSuite,
} from './scenarios.ts'

export const POSITIONAL_OPERATIONS = [
    'prepend',
    'remove',
    'reverse',
    'immutable',
] as const
export type PositionalOperation = (typeof POSITIONAL_OPERATIONS)[number]

export interface PositionalCounts {
    renderers: number
    mounts: number
    cleanups: number
}

const emptyCounts = (): PositionalCounts => ({
    renderers: 0,
    mounts: 0,
    cleanups: 0,
})
const onClick = () => {}

// Both passes use the same row template. Only the separate count pass wraps
// this renderer with counters and lifecycle hooks; timings have neither.
function renderRow(item: StableItem, index: number) {
    return html`<li data-id="${item.id}" aria-posinset="${index + 1}">
        <span class="position">${index + 1}</span>
        <button type="button" onclick="${onClick}">${item.name}</button>
    </li>`
}

function assertIndexedRows(
    container: Element,
    expected: StableItem[],
    previous?: Map<number, Element>
) {
    assertRows(container, expected, previous)
    const rows = container.querySelectorAll('[data-id]')
    for (const [index, item] of expected.entries()) {
        const row = rows[index]
        assert.equal(row.getAttribute('aria-posinset'), String(index + 1))
        assert.equal(row.children[0].textContent, String(index + 1))
        assert.equal(row.children[1].textContent, item.name)
    }
}

function createFixture(size: number, instrumented: boolean) {
    assert.ok(Number.isSafeInteger(size) && size > 0, 'positive row count')
    const items = generateItems(size)
    const container = document.createElement('div')
    const [getItems, setItems] = state(items)
    let counts = emptyCounts()
    let next = items
    let previous = new Map<number, Element>()
    const renderer = instrumented
        ? (item: StableItem, index: number) => {
              counts.renderers++
              const row = renderRow(item, index)
              row.onMount(() => {
                  counts.mounts++
                  return () => {
                      counts.cleanups++
                  }
              })
              return row
          }
        : renderRow
    const template = html`<ul>
        ${repeat(getItems, renderer, { key: (item) => item.id })}
    </ul>`
    template.render(container)
    assertIndexedRows(container, items)

    return {
        async prepare(operation: PositionalOperation) {
            setItems(items)
            await flushRenderQueue()
            assertIndexedRows(container, items)
            previous = getRows(container)
            next =
                operation === 'immutable'
                    ? items.map((item) => ({
                          ...item,
                          name: `${item.name}-updated`,
                      }))
                    : prepareUpdate(items, operation)
            counts = emptyCounts()
        },
        async update() {
            setItems(next)
            await flushRenderQueue()
        },
        verify(operation: PositionalOperation) {
            if (operation === 'immutable') {
                assert.equal(next.length, items.length)
                next.forEach((item, index) => {
                    assert.notEqual(item, items[index])
                    assert.equal(item.id, items[index].id)
                    assert.equal(item.name, `${items[index].name}-updated`)
                })
            } else {
                assertUpdate(items, next, operation)
            }
            // These checks make stale indices or replaced surviving rows fail,
            // including during warmup, instead of looking artificially fast.
            assertIndexedRows(container, next, previous)
            if (instrumented) {
                assert.deepEqual(counts, {
                    renderers: expectedRenderCalls(size, operation),
                    mounts: operation === 'prepend' ? 1 : 0,
                    cleanups: operation === 'remove' ? 1 : 0,
                })
            }
        },
        snapshot: () => ({ ...counts }),
        dispose() {
            template.unmount()
            assert.equal(container.childNodes.length, 0)
        },
    }
}

export function createPositionalListSuite(
    size: number,
    options: BenchOptions = {}
): BenchmarkSuite {
    const bench = new Bench({
        time: 0,
        iterations: 16,
        warmupTime: 0,
        warmupIterations: 5,
        ...options,
        retainSamples: true,
        throws: true,
    })
    const verifiedIterations = new Map<string, number>()
    const fixtures = new Set<ReturnType<typeof createFixture>>()
    for (const operation of POSITIONAL_OPERATIONS) {
        const name = `${operation} - indexed keyed rows - size ${size}`
        let fixture: ReturnType<typeof createFixture> | undefined
        verifiedIterations.set(name, 0)
        bench.add(name, async () => fixture!.update(), {
            async beforeEach() {
                if (!fixture) {
                    fixture = createFixture(size, false)
                    fixtures.add(fixture)
                }
                // Restoring/validating the baseline and allocating the next
                // input occur outside Tinybench's measured callback.
                await fixture.prepare(operation)
            },
            afterEach() {
                fixture!.verify(operation)
                verifiedIterations.set(name, verifiedIterations.get(name)! + 1)
            },
            afterAll() {
                fixture!.dispose()
                fixtures.delete(fixture!)
                fixture = undefined
            },
        })
    }
    return {
        bench,
        verifiedIterations,
        dispose() {
            for (const fixture of fixtures) fixture.dispose()
            fixtures.clear()
        },
    }
}

export async function countPositionalListWork(size: number) {
    const fixture = createFixture(size, true)
    const operations: Array<{
        operation: PositionalOperation
        counts: PositionalCounts
    }> = []
    try {
        const initial = fixture.snapshot()
        assert.deepEqual(initial, {
            renderers: size,
            mounts: size,
            cleanups: 0,
        })
        for (const operation of POSITIONAL_OPERATIONS) {
            await fixture.prepare(operation)
            await fixture.update()
            fixture.verify(operation)
            operations.push({ operation, counts: fixture.snapshot() })
        }
        return { initial, operations }
    } finally {
        fixture.dispose()
    }
}
