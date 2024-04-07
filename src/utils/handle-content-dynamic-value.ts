import { val } from './val'
import { syncNodes } from './sync-nodes'
import { resolveDynamicValueToNodes } from './resolve-dynamic-value-to-nodes'
import { DynamicValue } from '../types'
import { shallowCopyArrayOrObjectLiteral } from './shallow-copy-array-or-object-literal'
import { HtmlTemplate } from '../html'

const getDataAsList = (data: unknown): unknown[] => {
    if (!data) return []

    if (Array.isArray(data)) {
        return data.flat(Infinity)
    }

    return [data]
}

export const handleContentDynamicValue = (
    dv: DynamicValue,
    refs: Record<string, Set<Element>>
) => {
    const newData = val(dv.value)
    const isTemplate = newData instanceof HtmlTemplate

    if (isTemplate || newData !== dv.data) {
        // if the template is already mounted we just need to resolve it to
        // a list of nodes and move on as its internal dynamic value will
        // sync the nodes depending on the type otherwise when we try to
        // resolve them again, we will end up unmounting them
        if (isTemplate && newData.mounted) {
            dv.renderedNodes = Array.from(
                new Set(resolveDynamicValueToNodes(dv, refs))
            )
        } else {
            // need to get the parentNode of the renderedNodes before
            // resolveDynamicValueToNodes because that could unmount a node further down
            const parentNode = dv.renderedNodes.find(
                (n) => n.parentNode !== null
            )?.parentNode
            dv.renderedNodes = syncNodes(
                dv.renderedNodes,
                Array.from(new Set(resolveDynamicValueToNodes(dv, refs))),
                parentNode
            )
        }

        // the syncNodes only deals with Nodes but at the data level
        // we could have HTMLTemplates which nodes were unmounted but the template
        // reference would still be around so therefore we need to find those which
        // are not longer being tracked and unmount them
        if (dv.data) {
            const newDataList = new Set(getDataAsList(newData))
            const currentDataList = getDataAsList(dv.data)

            for (const v of currentDataList) {
                if (v instanceof HtmlTemplate && !newDataList.has(v)) {
                    v.unmount()
                }
            }
        }

        // make a shallow copy of the data just in case the user updates the object in place
        // which means the tracked data would also be updated and cause issues
        dv.data = shallowCopyArrayOrObjectLiteral(newData)
    }
}
