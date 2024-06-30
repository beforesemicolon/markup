import { HtmlTemplate } from '../html'
import { createAndRenderTextNode } from './create-and-render-text-node'

export const renderContent = (
    content: unknown,
    parentNode: HTMLElement | DocumentFragment,
    onTemplate?: (template: HtmlTemplate) => void
): Node[] => {
    if (content instanceof HtmlTemplate) {
        content.render(parentNode)
        onTemplate?.(content)
        return content.nodes
    }

    if (Array.isArray(content)) {
        return content.flatMap((item) =>
            Array.isArray(item)
                ? createAndRenderTextNode(item, parentNode)
                : renderContent(item, parentNode)
        )
    }

    if (content instanceof Node) {
        parentNode.appendChild(content)
        return [content]
    }

    return [createAndRenderTextNode(content, parentNode)]
}
