import { HtmlTemplate } from '../html.ts'

export type NormalizedContent = Node | HtmlTemplate

const normalizeValue = (value: unknown): NormalizedContent => {
    if (value instanceof Node || value instanceof HtmlTemplate) {
        return value
    }

    return document.createTextNode(String(value))
}

/**
 * Normalizes renderable content into the representation used by both initial
 * rendering and reactive updates. Arrays are flattened by one level only;
 * nested arrays are rendered as text to preserve existing behavior.
 */
export const normalizeContent = (content: unknown): NormalizedContent[] =>
    Array.isArray(content)
        ? content.map((item) => normalizeValue(item))
        : [normalizeValue(content)]
