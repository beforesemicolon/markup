import { HtmlTemplate } from '../html.ts'
import { normalizeContent } from './normalize-content.ts'

export const renderContent = (
    content: unknown,
    parentNode: HTMLElement | DocumentFragment,
    cb: (item: HtmlTemplate | Node) => void
) => {
    for (const item of normalizeContent(content)) {
        if (item instanceof HtmlTemplate) {
            item.render(parentNode)
        } else {
            parentNode.appendChild(item)
        }

        cb(item)
    }
}
