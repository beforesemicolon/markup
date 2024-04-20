import { DynamicValueResolver } from './DynamicValueResolver'
import { shallowCopyArrayOrObjectLiteral, val } from '../utils'
import { HtmlTemplate } from '../html'
import { resolveContentDynamicValueToNodes } from './resolve-content-dynamic-value-to-nodes'
import { syncNodes } from './sync-nodes'

const getDataAsList = (data: unknown): unknown[] => {
    if (!data) return []

    if (Array.isArray(data)) {
        return data.flat(Infinity)
    }

    return [data]
}

export class ContentDynamicValueResolver extends DynamicValueResolver {
    get renderedNodes() {
        return this.data instanceof HtmlTemplate
            ? this.data.nodes
            : super.renderedNodes
    }

    set renderedNodes(newNodes: Node[]) {
        super.renderedNodes = Array.from(new Set(newNodes))
    }

    resolve(refs: Record<string, Set<Element>>) {
        const newData = val(this.value)
        const isTemplate = newData instanceof HtmlTemplate

        if (isTemplate || newData !== this.data) {
            const currentNodes = this.renderedNodes
            // if the template is already mounted we just need to resolve it to
            // a list of nodes and move on as its internal dynamic value will
            // sync the nodes depending on the type otherwise when we try to
            // resolve them again, we will end up unmounting them
            if (isTemplate && newData.mounted) {
                resolveContentDynamicValueToNodes(newData, currentNodes, refs)
            } else {
                super.renderedNodes = syncNodes(
                    currentNodes,
                    resolveContentDynamicValueToNodes(
                        newData,
                        currentNodes,
                        refs
                    ),
                    // need to get the parentNode of the renderedNodes before
                    // resolveContentDynamicValueToNodes because that could unmount a node further down
                    currentNodes.find((n) => n.parentNode !== null)?.parentNode
                )
            }

            // the syncNodes only deals with Nodes but at the data level
            // we could have HTMLTemplates which nodes were unmounted but the template
            // reference would still be around so therefore we need to find those which
            // are not longer being tracked and unmount them
            if (this.data) {
                const newDataList = new Set(getDataAsList(newData))
                const currentDataList = getDataAsList(this.data)

                for (const v of currentDataList) {
                    if (v instanceof HtmlTemplate && !newDataList.has(v)) {
                        v.unmount()
                    }
                }
            }

            // make a shallow copy of the data just in case the user updates the object in place
            // which means the tracked data would also be updated and cause issues
            this.data = shallowCopyArrayOrObjectLiteral(newData)
        }
    }

    unmount() {
        unmount(this.data)
    }
}

function unmount(data: unknown) {
    data = val(data)

    if (data instanceof HtmlTemplate) {
        return data.unmount()
    }

    if (Array.isArray(data)) {
        return data.forEach(unmount)
    }
}
