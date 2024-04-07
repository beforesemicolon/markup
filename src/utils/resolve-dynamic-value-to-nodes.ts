import { DynamicValue } from '../types'
import { HtmlTemplate } from '../html'
import { Helper } from '../Helper'
import { jsonStringify } from './json-stringify'
import { val } from './val'

export const resolveDynamicValueToNodes = (
    dv: DynamicValue,
    refs: Record<string, Set<Element>> = {}
): Node[] => {
    if (dv.type === 'content') {
        return (function getNode(value: unknown): Node[] {
            if (value instanceof HtmlTemplate) {
                if (value.mounted) {
                    value.update()
                } else {
                    const frag = document.createDocumentFragment()
                    value.render(frag, true)
                }

                // collect dynamic refs that could appear
                // after render/update
                Object.entries(value.refs).forEach(([name, els]) => {
                    els.forEach((el) => {
                        if (!refs[name]) {
                            refs[name] = new Set()
                        }

                        refs[name].add(el)
                    })
                })

                return value.nodes
            }

            if (value instanceof Helper || typeof value === 'function') {
                return getNode(val(value))
            }

            if (Array.isArray(value)) {
                return value.flatMap(getNode)
            }

            if (value instanceof Node) {
                return [value]
            }

            const str = jsonStringify(value)

            const renderedNode = dv.renderedNodes[0]

            if (
                renderedNode.nodeValue === str &&
                renderedNode.nodeType === Node.TEXT_NODE
            ) {
                return [renderedNode]
            }

            return [document.createTextNode(str)]
        })(dv.value)
    }

    return dv.renderedNodes
}
