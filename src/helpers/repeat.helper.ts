import { val } from '../utils/val'
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

    return (anchor: Node) => {
        const list = getList(data) as T[]

        if (list.length === 0) {
            const res = whenEmpty?.() ?? []

            currentRenderedNodes = syncNodes(
                currentRenderedNodes,
                Array.isArray(res) ? res : [res],
                anchor
            )

            prevList = []
            cache.clear()
        } else {
            const prevListSet = new Set(prevList)
            const renderedList: Array<Node | HtmlTemplate> = []

            for (let i = 0; i < list.length; i++) {
                const item = list[i]

                prevListSet.delete(item)
                renderedList.push(each(item, i))
            }

            prevListSet.forEach((d) => cache.delete(d))

            prevList = list

            currentRenderedNodes = syncNodes(
                currentRenderedNodes,
                renderedList,
                anchor
            )
        }

        return new SkipRender()
    }
}
