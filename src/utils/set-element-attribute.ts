import { jsonStringify } from './json-stringify'
import { isPrimitive } from './is-primitive'

/**
 * sets attribute on an element. Handles web component element properties as well
 * @param el
 * @param key
 * @param value
 */
export const setElementAttribute = (
    el: Element,
    key: string,
    value: unknown
) => {
    el.setAttribute(key, jsonStringify(value))

    if (el.nodeName.includes('-') && !isPrimitive(value)) {
        const descriptors = Object.getOwnPropertyDescriptors(
            Object.getPrototypeOf(el)
        )

        // make sure the property can be set
        if (
            descriptors.hasOwnProperty(key) &&
            typeof descriptors[key].set === 'function'
        ) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore cant use string key for Element
            el[key] = value
        }
    }
}
