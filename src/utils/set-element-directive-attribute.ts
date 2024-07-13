import { val } from './val'
import { turnKebabToCamelCasing } from './turn-kebab-to-camel-casing'
import { turnCamelToKebabCasing } from './turn-camel-to-kebab-casing'
import { booleanAttributes } from './boolean-attributes'
import { setElementAttribute } from './set-element-attribute'

const simpleParseString = (value: string) => {
    if (value === 'undefined') {
        return undefined
    }

    if (/^(true|false)$/.test(value)) {
        return /^true$/.test(value)
    }

    if (/^[\d.]+$/.test(value)) {
        return Number(value)
    }

    return value
}

export const setElementDirectiveAttribute = (
    attrName: string,
    property: string,
    values: unknown[],
    element: HTMLElement
) => {
    let data = ''

    for (let i = 0; i < values.length; i++) {
        data += String(val(values[i]))
    }

    const valueParts = data.split(/\|/)
    const [value, condition] = valueParts.map((s) => s.trim())
    const parsedValue = simpleParseString(value)
    const shouldAdd =
        valueParts.length > 1 ? simpleParseString(condition) : parsedValue

    if (attrName === 'style') {
        setElementStyle(property, value, shouldAdd, element)
    } else if (attrName === 'class') {
        setElementClass(property, value, shouldAdd, element)
    } else if (attrName === 'data') {
        setElementDataAttribute(property, value, shouldAdd, element)
    } else if (attrName) {
        setElementBooleanAttribute(
            attrName,
            value,
            parsedValue,
            shouldAdd,
            element
        )
    }
}

function setElementBooleanAttribute(
    attrName: string,
    value: string,
    parsedValue: unknown,
    shouldAdd: unknown,
    element: HTMLElement
) {
    const boolAttr = booleanAttributes[attrName]
    const boolAttributeWithValidPossibleValue =
        boolAttr?.possibleValues?.includes(value)
    // when it's a native boolean attribute, the value itself should be the flag to whether add/remove it
    // unless it is a boolean attribute with a valid possible value
    shouldAdd =
        boolAttr &&
        !boolAttributeWithValidPossibleValue &&
        typeof parsedValue === 'boolean'
            ? parsedValue
            : shouldAdd

    if (shouldAdd) {
        setElementAttribute(element, attrName, value)
    } else {
        element.removeAttribute(attrName)
    }
}

function setElementDataAttribute(
    property: string,
    value: string,
    shouldAdd: unknown,
    element: HTMLElement
) {
    if (property) {
        if (shouldAdd) {
            element.dataset[turnKebabToCamelCasing(property)] = value
        } else {
            element.removeAttribute(`data-${turnCamelToKebabCasing(property)}`)
        }
    }
}

function setElementClass(
    property: string,
    value: string,
    shouldAdd: unknown,
    element: HTMLElement
) {
    if (property) {
        if (shouldAdd) {
            element.classList.add(property)
        } else {
            element.classList.remove(property)
        }
    } else {
        // ''.split(/\s+/g) results in [''] which will fail in classList actions
        for (const cls of value ? value.split(/\s+/g) : []) {
            if (shouldAdd) {
                element.classList.add(cls)
            } else {
                element.classList.remove(cls)
            }
        }
    }

    if (!element.classList.length) {
        element.removeAttribute('class')
    }
}

function setElementStyle(
    property: string,
    value: string,
    shouldAdd: unknown,
    element: HTMLElement
) {
    if (property) {
        element.style.setProperty(property, shouldAdd ? value : '')
    } else {
        for (const style of value.match(/([a-z][a-z-]+)(?=:):([^;]+)/g) ?? []) {
            const [name, styleValue] = style.split(':').map((s) => s.trim())

            if (shouldAdd) {
                element.style.setProperty(name, styleValue)
            } else {
                element.style.removeProperty(name)
            }
        }
    }

    if (!element.style.length) {
        element.removeAttribute('style')
    }
}
