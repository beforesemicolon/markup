import { helper } from '../helper'

type DataGetter<T> = () => number | Array<T>

export const repeat = helper(
    <T, R>(
        data: number | Array<T> | DataGetter<T>,
        cb: (data: T, index: number) => R
    ) => {
        const listMap: Map<T, R> = new Map()
        let list: T[] = []
        let prevList = list

        const each = (d: T, i: number) => {
            if (!listMap.has(d)) {
                listMap.set(d, cb(d, i))
            }

            return listMap.get(d)
        }

        const dataIsFn = typeof data === 'function'
        const fn = dataIsFn ? (data as DataGetter<T>) : () => []

        return () => {
            if (dataIsFn) {
                data = fn()
            }

            if (typeof data === 'number') {
                list = Array.from({ length: data }, (_, i) => i + 1) as T[]
            } else {
                list = data as T[]
            }

            // need to generate a new list if the list changed in any way, order of items or the items themselves
            if (
                list.some((item, i) =>
                    prevList[i] ? item !== prevList[i] : false
                )
            ) {
                listMap.clear() // will force the generation of new items
            }

            prevList = list

            return (list as T[]).map(each)
        }
    }
)
