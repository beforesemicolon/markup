import assert from 'node:assert/strict'
import { Bench, type BenchOptions } from 'tinybench'
import { repeat } from '../../src/index.ts'
import { generateItems, type StableItem } from './fixtures.ts'
import {
    assertItems,
    assertUpdate,
    expectedRenderCalls,
    prepareUpdate,
    type BenchmarkSuite,
    type UpdateOperation,
} from './scenarios.ts'

export function createRepeatCacheSuite(
    size: number,
    options: BenchOptions = {}
): BenchmarkSuite {
    const bench = new Bench({
        time: 50,
        ...options,
        retainSamples: true,
        throws: true,
    })
    const verifiedIterations = new Map<string, number>()
    const items = generateItems(size)
    const scenarios: Array<{
        name: string
        operation?: UpdateOperation
        keyed?: boolean
    }> = [
        { name: 'Initial Cache Evaluation (Minimal)' },
        { name: 'Stable Reevaluation (Same Array)', operation: 'same-array' },
        { name: 'Stable Reevaluation (New Array)', operation: 'new-array' },
        { name: 'Immutable Copy', operation: 'immutable' },
        { name: 'Immutable Copy (Keyed)', operation: 'immutable', keyed: true },
        { name: 'Append 1 item', operation: 'append' },
        { name: 'Prepend 1 item', operation: 'prepend' },
        { name: 'Remove 1 item', operation: 'remove' },
    ]

    for (const { name, operation, keyed } of scenarios) {
        const taskName = `${name} - Size ${size}`
        let current = items
        let next = items
        let output: unknown
        let lastOutput: unknown
        let baseline: unknown
        let renderCalls = 0
        let evaluate: (() => unknown) | undefined
        // Reuse the added item across samples. If cache restoration regresses,
        // later append/prepend samples become cache hits and fail the call check.
        const mutation =
            operation === 'append' ||
            operation === 'prepend' ||
            operation === 'remove'
                ? prepareUpdate(items, operation)
                : undefined
        const renderer = (item: StableItem) => {
            renderCalls++
            return item
        }
        const createEvaluator = () =>
            repeat(() => current, renderer, {
                key: keyed ? (item) => item.id : undefined,
            })

        verifiedIterations.set(taskName, 0)
        bench.add(
            taskName,
            () => {
                // Tinybench 3 probes synchronous functions when adding tasks,
                // before hooks have run. That probe must not create a sample.
                if (!evaluate) return
                current = next
                output = evaluate()
                lastOutput = output
            },
            {
                beforeEach() {
                    current = items
                    if (!evaluate || !operation) evaluate = createEvaluator()
                    if (operation) {
                        // Restore the actual repeat cache, not just its input.
                        lastOutput = evaluate()
                        assertItems(lastOutput, items)
                        baseline = lastOutput
                    }
                    next =
                        mutation ??
                        (operation ? prepareUpdate(items, operation) : items)
                    output = undefined
                    renderCalls = 0
                },
                afterEach() {
                    if (operation) {
                        assertItems(baseline, items)
                        assertUpdate(items, next, operation)
                    }
                    assertItems(output, next)
                    assert.equal(
                        renderCalls,
                        operation ? expectedRenderCalls(size, operation) : size,
                        `${taskName}: renderer work drifted`
                    )
                    verifiedIterations.set(
                        taskName,
                        verifiedIterations.get(taskName)! + 1
                    )
                },
            }
        )
    }

    return { bench, verifiedIterations, dispose() {} }
}
