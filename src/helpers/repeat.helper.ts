import { helper } from '../Helper'
import { val } from '../utils/val'

type DataGetter<T> = () => number | Array<T>

const getList = (data: unknown) => {
    data = val(data)

    if (Array.isArray(data)) {
        return data
    }

    if (typeof data === 'number') {
        return Array.from({ length: data }, (_, i) => i + 1)
    }

    return []
}

/**
 * renders things repeatedly based on first argument list or number
 * @param data
 * @param cb
 * @param whenEmpty
 */
export const repeat = helper(
    <T>(
        data: number | Array<T> | DataGetter<T>,
        cb: (data: T, index: number) => unknown,
        whenEmpty: () => unknown = () => ''
    ) => {
        const cache: Map<T, unknown> = new Map()
        let prevList: unknown[] = []

        const each = (d: T, i: number) => {
            if (!cache.has(d)) {
                cache.set(d, cb(d, i))
            }

            return cache.get(d)
        }

        return () => {
            const list = getList(data)

            // clear the cache for items no longer in the list or that moved
            list.forEach((item, i) => {
                if (prevList[i] !== undefined && item !== prevList[i]) {
                    cache.delete(item)
                }
            })

            prevList = list

            if (list.length === 0) {
                return whenEmpty()
            }

            return (list as T[]).map(each)
        }
    }
)
