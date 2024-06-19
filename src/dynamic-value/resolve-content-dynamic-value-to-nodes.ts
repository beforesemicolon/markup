import { HtmlTemplate } from '../html'
import { val, jsonStringify } from '../utils'
import { isDynamicValue } from './is-dynamic-value'

export const resolveContentDynamicValueToNodes = (
    data: unknown,
    renderedNodes: Node[],
    refs: Record<string, Set<Element>> = {}
): Node[] => {
    if (!isDynamicValue(data)) {
        return getTextNode(data, renderedNodes[0], renderedNodes.length === 1)
    }

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
            for (const [name, els] of Object.entries(value.refs)) {
                for (const el of els) {
                    if (!refs[name]) {
                        refs[name] = new Set()
                    }

                    refs[name].add(el)
                }
            }

            return value.nodes
        }

        if (typeof value === 'function') {
            return getNode(val(value))
        }

        if (Array.isArray(value)) {
            return value.flatMap(getNode)
        }

        if (value instanceof Node) {
            return [value]
        }

        return getTextNode(value, renderedNodes[0])
    })(data)
}

function getTextNode(value: unknown, renderedNode: Node, onlyNode = false) {
    const str = jsonStringify(value)

    if (renderedNode?.nodeType === Node.TEXT_NODE) {
        // sometimes the rendered node just got a text update and
        // as long as it's the only child just updating it is enough
        // which saves on the creation of new text node just for a value change
        if (onlyNode && renderedNode.isConnected) {
            renderedNode.nodeValue = str
        }

        if (renderedNode?.nodeValue === str) {
            return [renderedNode]
        }
    }

    return [document.createTextNode(str)]
}
