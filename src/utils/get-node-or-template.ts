import { HtmlTemplate } from '../html.ts'

export function getNodeOrTemplate(value: unknown) {
    if (value instanceof Node || value instanceof HtmlTemplate) return value
    return document.createTextNode(String(value))
}
