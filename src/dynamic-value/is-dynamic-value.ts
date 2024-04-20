import { HtmlTemplate } from '../html'
import { Helper } from '../Helper'

export const isDynamicValue = (x: unknown) =>
    typeof x === 'function' ||
    x instanceof HtmlTemplate ||
    x instanceof Helper ||
    Array.isArray(x)
