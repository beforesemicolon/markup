import { HtmlTemplate } from '../html'
import { createAndRenderTextNode } from './create-and-render-text-node'

export const renderContent = (
    content: unknown,
    parentNode: HTMLElement | DocumentFragment,
    cb?: (item: HtmlTemplate | Node) => void
): Node[] => {
    if (content instanceof HtmlTemplate) {
        content.render(parentNode)
        cb?.(content)
        return content.nodes
    }

    if (Array.isArray(content)) {
        let nodes: Node[] = []

        for (const item of content) {
            if (Array.isArray(item)) {
                const text = createAndRenderTextNode(item, parentNode)
                cb?.(text)
                nodes.push(text)
            } else {
                nodes = nodes.concat(renderContent(item, parentNode, cb))
            }
        }

        return nodes
    }

    if (content instanceof Node) {
        parentNode.appendChild(content)
        cb?.(content)
        return [content]
    }

    const text = createAndRenderTextNode(content, parentNode)
    cb?.(text)
    return [text]
}
