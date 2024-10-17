import { HtmlTemplate } from '../html'

function createAndRenderTextNode(
    value: unknown,
    parentNode: HTMLElement | DocumentFragment | Element
) {
    const node = document.createTextNode(String(value))
    parentNode.appendChild(node)
    return node
}

export const renderContent = (
    content: unknown,
    parentNode: HTMLElement | DocumentFragment,
    cb: (item: HtmlTemplate | Node) => void
) => {
    if (Array.isArray(content)) {
        for (const item of content) {
            // ensure only one level of the Array is rendered
            if (Array.isArray(item)) {
                cb(createAndRenderTextNode(item, parentNode))
            } else {
                renderContent(item, parentNode, cb)
            }
        }

        return
    }

    if (content instanceof HtmlTemplate) {
        content.render(parentNode)
        return cb(content)
    }

    if (content instanceof Node) {
        parentNode.appendChild(content)
        return cb(content)
    }

    cb(createAndRenderTextNode(content, parentNode))
}
