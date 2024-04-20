import { HtmlTemplate } from '../html'
import { Helper } from '../Helper'
import { jsonStringify } from '../utils/json-stringify'
import { val } from '../utils/val'

export const resolveContentDynamicValueToNodes = (
    data: unknown,
    renderedNodes: Node[],
    refs: Record<string, Set<Element>> = {}
): Node[] => {
    return (function getNode(value): Node[] {
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

        const renderedNode = renderedNodes[0]

        if (
            renderedNode &&
            renderedNode.nodeValue === str &&
            renderedNode.nodeType === Node.TEXT_NODE
        ) {
            return [renderedNode]
        }

        return [document.createTextNode(str)]
    })(data)
}
