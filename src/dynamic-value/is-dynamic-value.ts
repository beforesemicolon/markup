import { HtmlTemplate } from '../html'

export const isDynamicValue = (x: unknown) =>
    typeof x === 'function' ||
    x instanceof HtmlTemplate ||
    x instanceof Node ||
    Array.isArray(x)
