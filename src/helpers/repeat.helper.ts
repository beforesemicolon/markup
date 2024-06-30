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
export const repeat = <T>(
    data: number | Array<T> | DataGetter<T>,
    cb: (data: T, index: number) => unknown,
    whenEmpty: () => unknown = () => ''
) => {
    const cache: Map<T, unknown> = new Map()
    let prevList: unknown[] = []

    const each = (d: T, i: number) => {
        if (prevList[i] !== undefined && d !== prevList[i]) {
            cache.delete(d)
        }

        if (!cache.has(d)) {
            cache.set(d, cb(d, i))
        }

        return cache.get(d)
    }

    return () => {
        const list = getList(data)

        if (list.length === 0) {
            prevList = []
            return whenEmpty()
        }

        const renderedList = []

        for (let i = 0; i < list.length; i++) {
            renderedList.push(each(list[i], i))
        }

        prevList = list

        return renderedList
    }
}
