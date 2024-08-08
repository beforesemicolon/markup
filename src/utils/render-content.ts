import { HtmlTemplate } from '../html'
import { createAndRenderTextNode } from './create-and-render-text-node'

export const renderContent = (
    content: unknown,
    parentNode: HTMLElement | DocumentFragment,
    cb?: (item: HtmlTemplate | Node) => void
) => {
    if (content instanceof HtmlTemplate) {
        content.render(parentNode)
        return cb?.(content)
    }

    if (Array.isArray(content)) {
        for (const item of content) {
            if (Array.isArray(item)) {
                const text = createAndRenderTextNode(item, parentNode)
                cb?.(text)
            } else {
                renderContent(item, parentNode, cb)
            }
        }

        return
    }

    if (content instanceof Node) {
        parentNode.appendChild(content)
        return cb?.(content)
    }

    cb?.(createAndRenderTextNode(content, parentNode))
}
