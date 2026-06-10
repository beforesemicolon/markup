import { Bench } from 'tinybench'
import { repeat } from '../src/index.ts'
import {
    generateItems,
    copyItems,
    generatePrimitives,
    renderMinimal,
} from './helpers/fixtures.ts'
import { getEnvironmentInfo } from './helpers/environment.ts'
import { printReport } from './helpers/report.ts'

const env = getEnvironmentInfo()
const SIZES = [20, 60, 250, 1000]

async function run() {
    for (const size of SIZES) {
        const bench = new Bench({ time: 50 })

        const items = generateItems(size)

        // 1. Cold Render
        bench.add(`Cold Render (Minimal) - Size ${size}`, () => {
            const get = repeat(() => items, renderMinimal)
            get()
        })

        // 2. Stable Reevaluation (Same Array)
        const getStable = repeat(() => items, renderMinimal)
        getStable()
        bench.add(`Stable Reevaluation (Same Array) - Size ${size}`, () => {
            getStable()
        })

        // 3. New Array (Same Refs)
        let arrayRef = items
        const getNewArray = repeat(() => arrayRef, renderMinimal)
        getNewArray()
        bench.add(`Stable Reevaluation (New Array) - Size ${size}`, () => {
            arrayRef = [...items]
            getNewArray()
        })

        // 4. Immutable Copy (New Refs, Same IDs)
        let copyRef = items
        const getImmutable = repeat(() => copyRef, renderMinimal)
        getImmutable()
        bench.add(`Immutable Copy - Size ${size}`, () => {
            copyRef = copyItems(copyRef)
            getImmutable()
        })

        // 4b. Immutable Copy (Keyed)
        let copyRefKeyed = items
        const getImmutableKeyed = repeat(() => copyRefKeyed, renderMinimal, {
            key: (item) => item.id,
        })
        getImmutableKeyed()
        bench.add(`Immutable Copy (Keyed) - Size ${size}`, () => {
            copyRefKeyed = copyItems(copyRefKeyed)
            getImmutableKeyed()
        })

        // 5. Append 1 item
        let appendRef = items
        const getAppend = repeat(() => appendRef, renderMinimal)
        getAppend()
        bench.add(`Append 1 item - Size ${size}`, () => {
            appendRef = [...items, { id: size + 1, name: `item-${size + 1}` }]
            getAppend()
        })

        // 6. Prepend 1 item
        let prependRef = items
        const getPrepend = repeat(() => prependRef, renderMinimal)
        getPrepend()
        bench.add(`Prepend 1 item - Size ${size}`, () => {
            prependRef = [{ id: 0, name: 'item-0' }, ...items]
            getPrepend()
        })

        // 7. Remove 1 item
        let removeRef = items
        const getRemove = repeat(() => removeRef, renderMinimal)
        getRemove()
        bench.add(`Remove 1 item - Size ${size}`, () => {
            removeRef = items.filter((_, idx) => idx !== Math.floor(size / 2))
            getRemove()
        })

        await bench.run()
        printReport(`Repeat Cache Bookkeeping - Size ${size}`, bench, env)
    }
}

run().catch(console.error)
