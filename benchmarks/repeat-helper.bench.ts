import 'global-jsdom/register'
import { Bench } from 'tinybench'
import { repeat } from '../src/helpers/repeat.helper.ts'
import { html } from '../src/html.ts'

const SIZES = [20, 60, 250, 1000]

type Item = { id: number; name: string }

const makeItems = (size: number): Item[] =>
    Array.from({ length: size }, (_, i) => ({ id: i, name: `item-${i}` }))

const copyItems = (items: Item[]) => items.map((item) => ({ ...item }))

async function runGetterBench(size: number) {
    const original = makeItems(size)

    let stableData = original
    let stableCalls = 0
    const stableRepeat = repeat(
        () => stableData,
        (item) => {
            stableCalls += 1
            return item.id
        },
        { key: (item) => item.id }
    )
    stableRepeat()
    stableCalls = 0

    let immutableData = original
    let immutableCalls = 0
    const immutableRepeat = repeat(
        () => immutableData,
        (item) => {
            immutableCalls += 1
            return item.id
        },
        { key: (item) => item.id }
    )
    immutableRepeat()
    immutableCalls = 0

    let unkeyedData = original
    let unkeyedCalls = 0
    const unkeyedRepeat = repeat(
        () => unkeyedData,
        (item) => {
            unkeyedCalls += 1
            return item.id
        }
    )
    unkeyedRepeat()
    unkeyedCalls = 0

    const bench = new Bench({ time: 150, warmupTime: 75 })

    bench.add(`stable-keyed:${size}`, () => {
        stableData = [...stableData]
        stableRepeat()
    })

    bench.add(`immutable-keyed:${size}`, () => {
        immutableData = copyItems(immutableData)
        immutableRepeat()
    })

    bench.add(`immutable-unkeyed:${size}`, () => {
        unkeyedData = copyItems(unkeyedData)
        unkeyedRepeat()
    })

    await bench.run()

    console.log(`\n--- repeat getter / size ${size} ---`)
    console.table(
        bench.tasks.map((task) => ({
            name: task.name,
            hz: Math.round(task.result?.hz ?? 0),
            meanMs: Number(((task.result?.mean ?? 0) * 1000).toFixed(4)),
        }))
    )
    console.log({ stableCalls, immutableCalls, unkeyedCalls })
}

async function runTemplateCreationBench(size: number) {
    const original = makeItems(size)

    let stableData = original
    let stableCalls = 0
    const stableRepeat = repeat(
        () => stableData,
        (item) => {
            stableCalls += 1
            return html`<span>${item.name}</span>`
        },
        { key: (item) => item.id }
    )
    stableRepeat()
    stableCalls = 0

    let immutableData = original
    let immutableCalls = 0
    const immutableRepeat = repeat(
        () => immutableData,
        (item) => {
            immutableCalls += 1
            return html`<span>${item.name}</span>`
        },
        { key: (item) => item.id }
    )
    immutableRepeat()
    immutableCalls = 0

    const bench = new Bench({ time: 150, warmupTime: 75 })

    bench.add(`template-stable-keyed:${size}`, () => {
        stableData = [...stableData]
        stableRepeat()
    })

    bench.add(`template-immutable-keyed:${size}`, () => {
        immutableData = copyItems(immutableData)
        immutableRepeat()
    })

    await bench.run()

    console.log(`\n--- repeat template creation / size ${size} ---`)
    console.table(
        bench.tasks.map((task) => ({
            name: task.name,
            hz: Math.round(task.result?.hz ?? 0),
            meanMs: Number(((task.result?.mean ?? 0) * 1000).toFixed(4)),
        }))
    )
    console.log({ stableCalls, immutableCalls })
}

async function run() {
    for (const size of SIZES) {
        await runGetterBench(size)
        await runTemplateCreationBench(size)
    }
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
