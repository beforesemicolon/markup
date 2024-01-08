import { ExecutableValue } from '../types'
import {
    booleanAttributes,
    jsonParse,
    turnCamelToKebabCasing,
    turnKebabToCamelCasing,
} from '../utils'

export const handleAttrDirectiveExecutable = (
    executableValue: ExecutableValue,
    rawValue: string
) => {
    if (rawValue !== executableValue.value) {
        const { name: attrName, prop: property } = executableValue
        executableValue.value = rawValue
        const element = executableValue.renderedNodes[0] as HTMLElement
        // eslint-disable-next-line prefer-const
        const valueParts = rawValue.split(/\|/)
        const [value, condition] = valueParts.map((s) => s.trim())
        const parsedValue = jsonParse(value)
        let shouldAdd = Boolean(
            valueParts.length > 1
                ? typeof condition === 'string'
                    ? jsonParse(condition)
                    : condition
                : parsedValue
        )

        switch (attrName) {
            case 'style':
                if (property) {
                    element.style.setProperty(property, shouldAdd ? value : '')
                } else {
                    value
                        .match(/([a-z][a-z-]+)(?=:):([^;]+)/g)
                        ?.forEach((style: string) => {
                            const [name, styleValue] = style
                                .split(':')
                                .map((s) => s.trim())

                            if (shouldAdd) {
                                element.style.setProperty(name, styleValue)
                            } else {
                                element.style.removeProperty(name)
                            }
                        })
                }

                if (!element.style.length) {
                    element.removeAttribute('style')
                }

                break
            case 'class':
                if (property) {
                    if (shouldAdd) {
                        element.classList.add(property)
                    } else {
                        element.classList.remove(property)
                    }
                } else {
                    // ''.split(/\s+/g) results in [''] which will fail in classList actions
                    ;(value ? value.split(/\s+/g) : []).forEach(
                        (cls: string) => {
                            if (shouldAdd) {
                                element.classList.add(cls)
                            } else {
                                element.classList.remove(cls)
                            }
                        }
                    )
                }

                if (!element.classList.length) {
                    element.removeAttribute('class')
                }
                break
            case 'data':
                if (property) {
                    if (shouldAdd) {
                        element.dataset[turnKebabToCamelCasing(property)] =
                            value
                    } else {
                        element.removeAttribute(
                            `data-${turnCamelToKebabCasing(property)}`
                        )
                    }
                }
                break
            default:
                if (attrName) {
                    const boolAttr = (
                        booleanAttributes as Record<
                            string,
                            { possibleValues?: string[] }
                        >
                    )[attrName]
                    const boolAttributeWithValidPossibleValue =
                        boolAttr?.possibleValues &&
                        boolAttr.possibleValues.includes(value)
                    // when it's a native boolean attribute, the value itself should be the flag to whether add/remove it
                    // unless it is a boolean attribute with a valid possible value
                    shouldAdd =
                        boolAttr &&
                        !boolAttributeWithValidPossibleValue &&
                        typeof parsedValue === 'boolean'
                            ? parsedValue
                            : shouldAdd

                    if (shouldAdd) {
                        if (boolAttr) {
                            element.setAttribute(
                                attrName,
                                boolAttributeWithValidPossibleValue
                                    ? value
                                    : 'true'
                            )
                        } else {
                            element.setAttribute(attrName, value)
                        }
                    } else {
                        element.removeAttribute(attrName)
                    }
                }
        }
    }
}
