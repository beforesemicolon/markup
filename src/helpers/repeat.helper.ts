import { val } from './val.ts'
import { ObjectLiteral, StateGetter } from '../types.ts'

export type RepeatData<T, K = string> =
    | number
    | ObjectLiteral<T>
    | Iterable<T>
    | Array<T>
    | Set<T>
    | Map<K, T>

export interface RepeatOptions<T, TKey> {
    key?: (item: T, index: number) => TKey
    empty?: () => unknown
}

interface RepeatEntry<T, TKey> {
    key: TKey
    item: T
    index: number
    rendered: unknown
}

const getList = (data: unknown) => {
    if (data) {
        if (typeof data === 'number') {
            return Array.from({ length: data }, (_, i) => i + 1)
        }

        if (
            typeof (data as Iterable<unknown>)[Symbol.iterator] === 'function'
        ) {
            return Array.from(data as Iterable<unknown>)
        }

        if (data instanceof Set || data instanceof Map) {
            return [...data.entries()]
        }

        if (data instanceof Object) {
            return Object.entries(data)
        }
    }

    return []
}

/**
 * renders things repeatedly based on first argument iterable or number
 * @param data
 * @param cb
 * @param emptyOrOptions
 */
export const repeat = <T, TKey = T, K = string>(
    data: RepeatData<T, K> | StateGetter<RepeatData<T, K>>,
    cb: (data: T, index: number) => unknown,
    emptyOrOptions?: (() => unknown) | RepeatOptions<T, TKey>
) => {
    let keyFn: ((item: T, index: number) => TKey) | undefined
    let emptyFn: (() => unknown) | undefined

    if (typeof emptyOrOptions === 'function') {
        emptyFn = emptyOrOptions
    } else if (emptyOrOptions && typeof emptyOrOptions === 'object') {
        keyFn = emptyOrOptions.key
        emptyFn = emptyOrOptions.empty
    }

    let previousEntries = new Map<unknown, RepeatEntry<T, unknown>>()

    return () => {
        const list = getList(val(data)) as T[]

        if (list.length === 0) {
            return emptyFn?.() ?? []
        }

        const nextEntries = new Map<unknown, RepeatEntry<T, unknown>>()
        const renderedValues = keyFn ? new Array(list.length) : null

        for (let index = 0; index < list.length; index += 1) {
            const item = list[index]
            const key = keyFn ? keyFn(item, index) : (item as unknown)

            if (keyFn) {
                if (nextEntries.has(key)) {
                    throw new Error(
                        `Duplicate key "${key}" detected at index ${index} in repeat. Keys must be unique.`
                    )
                }
            }

            const previous = previousEntries.get(key)
            let rendered: unknown

            if (previous && previous.item === item) {
                rendered = previous.rendered
            } else {
                rendered = cb(item, index)
            }

            const entry: RepeatEntry<T, unknown> = {
                key,
                item,
                index,
                rendered,
            }

            nextEntries.set(key, entry)
            if (renderedValues) {
                renderedValues[index] = rendered
            }
        }

        previousEntries = nextEntries
        return (
            renderedValues ||
            Array.from(nextEntries.values()).map((e) => e.rendered)
        )
    }
}
