import 'global-jsdom/register'
import { html, repeat, state } from '../src/index.ts'
import {
    generateItems,
    copyItems,
    renderFilesystemLike,
} from './helpers/fixtures.ts'
import { LifecycleTracker } from './helpers/lifecycle-counters.ts'
import { getEnvironmentInfo } from './helpers/environment.ts'

const env = getEnvironmentInfo()
const tracker = new LifecycleTracker()
const SIZE = 60

function printLifecycleReport(scenario: string, counts: any) {
    console.log(`Scenario: ${scenario}`)
    console.table(counts)
    console.log('--------------------------------------------------')
}

async function run() {
    console.log(`\n==================================================`)
    console.log(`LIFECYCLE OPERATION COUNTS (Size: ${SIZE})`)
    console.log(`==================================================`)
    console.log(`OS:     ${env.os}`)
    console.log(`CPU:    ${env.cpu}`)
    console.log(`Node:   ${env.node}`)
    console.log(`Commit: ${env.commit}`)
    console.log(`==================================================\n`)

    const items = generateItems(SIZE)
    const container = document.createElement('div')

    // 1. Initial Mount (Cold)
    tracker.reset()
    const wrappedRenderer = tracker.wrapRenderer(renderFilesystemLike)
    const [listState, setListState] = state(items)
    const tmpl = html`<div>${repeat(listState, wrappedRenderer)}</div>`
    tmpl.render(container)
    printLifecycleReport('1. Initial Mount (Cold)', tracker.counts)

    // 2. Update (Same Array Reference)
    tracker.reset()
    setListState(items)
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport('2. Update (Same Array Reference)', tracker.counts)

    // 3. Update (New Array Reference, Same Object References)
    tracker.reset()
    setListState([...items])
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport(
        '3. Update (New Array, Same Item Refs)',
        tracker.counts
    )

    // 3b. Update (Reverse List)
    tracker.reset()
    setListState([...items].reverse())
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport('3b. Update (Reverse List)', tracker.counts)

    // 4. Update (New Array, Immutable Copy/New Item Refs, Same IDs)
    tracker.reset()
    const copied = copyItems(items)
    setListState(copied)
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport(
        '4. Update (Immutable Copy / New Item Refs)',
        tracker.counts
    )

    // 5. Append 1 item
    tracker.reset()
    setListState([...copied, { id: SIZE + 1, name: `item-${SIZE + 1}` }])
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport('5. Append 1 Item', tracker.counts)

    // 6. Prepend 1 item
    tracker.reset()
    setListState([{ id: 0, name: 'item-0' }, ...copied])
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport('6. Prepend 1 Item', tracker.counts)

    // 7. Remove 1 item (middle)
    tracker.reset()
    setListState(copied.filter((_, idx) => idx !== Math.floor(SIZE / 2)))
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport('7. Remove 1 Item (Middle)', tracker.counts)

    // Cleanup
    tmpl.unmount()

    console.log(`\n==================================================`)
    console.log(`LIFECYCLE OPERATION COUNTS (Keyed, Size: ${SIZE})`)
    console.log(`==================================================`)

    const keyedContainer = document.createElement('div')
    tracker.reset()
    const keyedWrapped = tracker.wrapRenderer(renderFilesystemLike)
    const [keyedState, setKeyedState] = state(items)
    const keyedTmpl = html`<div>
        ${repeat(keyedState, keyedWrapped, { key: (item) => item.id })}
    </div>`
    keyedTmpl.render(keyedContainer)
    printLifecycleReport('1. Initial Mount (Cold) - Keyed', tracker.counts)

    // 2. Update (Same Array Reference)
    tracker.reset()
    setKeyedState(items)
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport(
        '2. Update (Same Array Reference) - Keyed',
        tracker.counts
    )

    // 3. Update (New Array, Same Item Refs) - Keyed
    tracker.reset()
    setKeyedState([...items])
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport(
        '3. Update (New Array, Same Item Refs) - Keyed',
        tracker.counts
    )

    // 3b. Update (Reverse List) - Keyed
    tracker.reset()
    setKeyedState([...items].reverse())
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport('3b. Update (Reverse List) - Keyed', tracker.counts)

    // 4. Update (New Array, Immutable Copy/New Item Refs, Same IDs) - Keyed
    tracker.reset()
    const copiedKeyed = copyItems(items)
    setKeyedState(copiedKeyed)
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport(
        '4. Update (Immutable Copy / New Item Refs) - Keyed',
        tracker.counts
    )

    // 5. Append 1 item
    tracker.reset()
    setKeyedState([...copiedKeyed, { id: SIZE + 1, name: `item-${SIZE + 1}` }])
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport('5. Append 1 Item - Keyed', tracker.counts)

    // 6. Prepend 1 item
    tracker.reset()
    setKeyedState([{ id: 0, name: 'item-0' }, ...copiedKeyed])
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport('6. Prepend 1 Item - Keyed', tracker.counts)

    // 7. Remove 1 item (middle)
    tracker.reset()
    setKeyedState(copiedKeyed.filter((_, idx) => idx !== Math.floor(SIZE / 2)))
    await new Promise((resolve) => queueMicrotask(resolve))
    printLifecycleReport('7. Remove 1 Item (Middle) - Keyed', tracker.counts)

    keyedTmpl.unmount()
    console.log('Teardown complete.\n')
}

run().catch(console.error)
