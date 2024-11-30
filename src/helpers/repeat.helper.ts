import { val } from './val.ts'
import { ObjectLiteral, StateGetter } from '../types.ts'

type repeatData<T> = number | ObjectLiteral<T> | Iterable<T>

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
 * @param whenEmpty
 */
export const repeat = <T>(
    data: repeatData<T> | StateGetter<repeatData<T>>,
    cb: (data: T, index: number) => unknown,
    whenEmpty?: () => unknown
) => {
    let map = new Map()

    return () => {
        map = (getList(val(data)) as T[]).reduce((acc, item, idx) => {
            acc.set(item, map.get(item) ?? cb(item, idx))
            return acc
        }, new Map())

        const list = Array.from(map.values())

        if (list.length === 0) {
            return whenEmpty?.() ?? []
        }

        return list
    }
}
