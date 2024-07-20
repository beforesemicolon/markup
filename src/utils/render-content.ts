import { HtmlTemplate } from '../html'
import { createAndRenderTextNode } from './create-and-render-text-node'

export const renderContent = (
    content: unknown,
    parentNode: HTMLElement | DocumentFragment,
    cb?: (item: HtmlTemplate | Node) => void
): Array<HtmlTemplate | Node> => {
    if (content instanceof HtmlTemplate) {
        content.render(parentNode)
        cb?.(content)
        return [content]
    }

    if (Array.isArray(content)) {
        let nodes: Array<HtmlTemplate | Node> = []

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
