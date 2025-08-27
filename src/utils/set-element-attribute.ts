import { isPrimitive } from './is-primitive.ts'
import { jsonStringify } from './json-stringify.ts'
import { booleanAttributes } from './boolean-attributes.ts'

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
    const descriptor =
        Object.getOwnPropertyDescriptor(el, key) ??
        // describe properties defined as setter/getter by checking the prototype
        Object.getOwnPropertyDescriptors(Object.getPrototypeOf(el))[key]
    const isWritable =
        descriptor?.writable || typeof descriptor?.set === 'function'

    // Using setAttribute() to modify certain attributes, most notably value in XUL, works inconsistently,
    // as the attribute specifies the default value. To access or modify the current values, you should use
    // the properties. For example, use elt.value instead of elt.setAttribute('value', val).
    // https://stackoverflow.com/questions/29929797/setattribute-doesnt-work-the-way-i-expect-it-to
    if (isWritable) {
        // @ts-expect-error Cannot assign to X because it is a read-only property.
        el[key] = value
    }

    // need to avoid invalid attribute scenarios:
    // disabled="false", checked="undefined", draggable="null"
    // or boolean attributes with any value. All those scenarios are invalid
    // and the attribute should be removed instead
    if (
        value !== undefined &&
        value !== null &&
        (!booleanAttributes[key] || !/^false$/.test(String(value).trim()))
    ) {
        const strValue = jsonStringify(value)

        if (
            // in case !isWritable or setting the property did not also update the attribute
            strValue !== el.getAttribute(key) &&
            // only set primitive values
            // only set non-primitive values on non-components
            // only set non-primitive values on web components if the property is !isWritable
            (isPrimitive(value) || !el.nodeName.includes('-') || !isWritable)
        ) {
            el.setAttribute(key, strValue)
        }
    } else {
        el.removeAttribute(key)
    }
}
