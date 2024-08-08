import { HtmlTemplate } from '../html'

export const removeTemplateOrNode = (n: HtmlTemplate | Node) => {
    if (n instanceof HtmlTemplate) {
        n.unmount()
    } else {
        n.parentNode?.removeChild(n)
    }
}
