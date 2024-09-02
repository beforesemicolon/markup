import { val } from './val'
import { DoubleLinkedList } from '../DoubleLinkedList'
import { HtmlTemplate } from '../html'
import { SkipRender } from '../types'
import { syncNodes } from '../utils/sync-nodes'
import { getNodeOrTemplate } from '../utils/get-node-or-template'

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
    whenEmpty?: () => unknown
) => {
    const cache: Map<T, Node | HtmlTemplate> = new Map()
    let currentRenderedNodes = new DoubleLinkedList<Node | HtmlTemplate>()
    let prevList: T[] = []

    const each = (d: T, i: number) => {
        if (!cache.has(d)) {
            cache.set(d, getNodeOrTemplate(cb(d, i)))
        }

        return cache.get(d) as Node | HtmlTemplate
    }

    return (anchor: Node, temp: HtmlTemplate) => {
        const list = getList(data) as T[]

        if (list.length === 0) {
            const res = whenEmpty?.() ?? []

            currentRenderedNodes = syncNodes(
                currentRenderedNodes,
                Array.isArray(res) ? res : [res],
                anchor,
                temp
            )

            prevList = []
            cache.clear()
        } else {
            const prevListSet = DoubleLinkedList.fromArray(prevList)

            currentRenderedNodes = syncNodes(
                currentRenderedNodes,
                new Proxy(list, {
                    get(_, prop) {
                        if (typeof prop === 'string') {
                            const idx = Number(prop)

                            if (!isNaN(idx)) {
                                const item = list[idx]
                                prevListSet.remove(item)
                                return each(item, idx)
                            }
                        }

                        return Reflect.get(_, prop)
                    },
                }) as Array<Node | HtmlTemplate>,
                anchor,
                temp
            )

            for (const d of prevListSet) {
                cache.delete(d)
            }

            prevList = list
        }

        return new SkipRender()
    }
}
