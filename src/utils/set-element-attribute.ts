import { isPrimitive } from './is-primitive.ts'
import { jsonStringify } from './json-stringify.ts'

/**
 * sets attribute on an element. Handles web component element properties as well
 * @param el
 * @param key
 * @param value
 */
export const setElementAttribute = (
    el: HTMLElement | Element,
    key: string,
    value: unknown
) => {
    if (value !== undefined && value !== null) {
        // take care of web component elements with prop setters
        if (el.nodeName.includes('-') && !isPrimitive(value)) {
            const descriptor =
                // describe the property directly on the object
                Object.getOwnPropertyDescriptor(el, key) ??
                // describe properties defined as setter/getter by checking the prototype
                Object.getOwnPropertyDescriptors(Object.getPrototypeOf(el))[key]

            if (descriptor?.writable || typeof descriptor?.set === 'function') {
                // @ts-expect-error Cannot assign to X because it is a read-only property.
                if (el[key] !== value) el[key] = value
            } else {
                const v = jsonStringify(value)
                if (v !== el.getAttribute(key)) el.setAttribute(key, v)
            }

            return
        }

        if (value !== el.getAttribute(key)) el.setAttribute(key, String(value))
    } else {
        el.removeAttribute(key)
    }
}
