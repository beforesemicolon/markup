import 'global-jsdom/register'
import assert from 'node:assert/strict'
import { html, repeat, state } from '../src/index.ts'
import { generateItems, renderFilesystemLike } from './helpers/fixtures.ts'
import {
    LifecycleTracker,
    type LifecycleCounts,
} from './helpers/lifecycle-counters.ts'
import { getEnvironmentInfo } from './helpers/environment.ts'
import {
    assertRows,
    assertUpdate,
    expectedRenderCalls,
    flushRenderQueue,
    getRows,
    prepareUpdate,
    type UpdateOperation,
} from './helpers/scenarios.ts'

const env = getEnvironmentInfo()
const SIZE = 60

function printLifecycleReport(scenario: string, counts: LifecycleCounts) {
    console.log(`Scenario: ${scenario}`)
    console.table(counts)
    console.log('--------------------------------------------------')
}

async function run() {
    console.log(`\nLIFECYCLE OPERATION COUNTS (Size: ${SIZE})`)
    console.log(`OS:     ${env.os}`)
    console.log(`CPU:    ${env.cpu}`)
    console.log(`Node:   ${env.node}`)
    console.log(`Commit: ${env.commit}`)
    console.log('Renderers are instrumented with lifecycle hooks.\n')

    const scenarios: Array<{ name: string; operation: UpdateOperation }> = [
        {
            name: 'No-op update (Same Array Reference)',
            operation: 'same-array',
        },
        { name: 'Update (New Array, Same Item Refs)', operation: 'new-array' },
        { name: 'Update (Reverse List)', operation: 'reverse' },
        {
            name: 'Update (Immutable Copy / New Item Refs)',
            operation: 'immutable',
        },
        { name: 'Append 1 Item', operation: 'append' },
        { name: 'Prepend 1 Item', operation: 'prepend' },
        { name: 'Remove 1 Item (Middle)', operation: 'remove' },
    ]

    for (const keyed of [false, true]) {
        const tracker = new LifecycleTracker()
        const items = generateItems(SIZE)
        const container = document.createElement('div')
        const [listState, setListState] = state(items)
        const template = html`<div>
            ${repeat(listState, tracker.wrapRenderer(renderFilesystemLike), {
                key: keyed ? (item) => item.id : undefined,
            })}
        </div>`
        const suffix = keyed ? ' - Keyed' : ''

        try {
            template.render(container)
            assertRows(container, items)
            assert.equal(tracker.counts.renders, SIZE)
            assert.equal(tracker.counts.mounts, SIZE)
            printLifecycleReport(`Initial Mount${suffix}`, tracker.counts)

            for (const { name, operation } of scenarios) {
                // Each report starts from exactly SIZE rows. Without this,
                // prepend also removed the previous append, and remove also
                // removed the previous prepend.
                setListState(items)
                await flushRenderQueue()
                assertRows(container, items)
                const previousRows = getRows(container)
                const next = prepareUpdate(items, operation)
                tracker.reset()

                setListState(next)
                await flushRenderQueue()

                // Lifecycle hooks intentionally disable template rebinding for
                // immutable copies; other operations preserve retained rows.
                assertUpdate(items, next, operation)
                assertRows(
                    container,
                    next,
                    operation === 'immutable' ? undefined : previousRows
                )
                assert.equal(
                    tracker.counts.renders,
                    expectedRenderCalls(SIZE, operation)
                )
                assert.equal(
                    tracker.counts.mounts,
                    expectedRenderCalls(SIZE, operation)
                )
                assert.equal(
                    tracker.counts.unmounts,
                    operation === 'immutable'
                        ? SIZE
                        : operation === 'remove'
                          ? 1
                          : 0
                )
                printLifecycleReport(`${name}${suffix}`, tracker.counts)
            }
        } finally {
            template.unmount()
            assert.equal(container.childNodes.length, 0)
        }
    }
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
