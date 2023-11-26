import { isPrimitive, jsonStringify, turnCamelToKebabCasing } from '.'
import { doc } from '../doc'

export interface ElementOptions<A> {
    attributes?: A
    textContent?: string
    htmlContent?: string
    ns?: 'http://www.w3.org/1999/xhtml' | 'http://www.w3.org/2000/svg'
}

/**
 * creates HTML element based of provided details
 * @param tagName
 * @param attributes
 * @param htmlContent
 * @param textContent
 * @param ns
 */
export const element = <A>(
    tagName: string,
    {
        attributes = {} as A,
        htmlContent = '',
        textContent = '',
        ns = 'http://www.w3.org/1999/xhtml',
    }: ElementOptions<A> = {}
) => {
    if (tagName) {
        const Comp = customElements.get(tagName)
        const el = Comp ? new Comp() : doc.createElementNS(ns, tagName)

        Object.entries(attributes as Record<string, unknown>).forEach(
            ([key, val]) => {
                if (/^on[a-z]+/.test(key)) {
                    typeof val === 'function' &&
                        el.addEventListener(
                            key.slice(2).toLowerCase(),
                            val as EventListenerOrEventListenerObject
                        )
                } else {
                    el.setAttribute(
                        turnCamelToKebabCasing(key),
                        jsonStringify(val)
                    )

                    if (Comp && !isPrimitive(val)) {
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
                            el[key] = val
                        }
                    }
                }
            }
        )

        if (textContent) {
            el.textContent = jsonStringify(textContent)
        } else if (htmlContent) {
            el.innerHTML = htmlContent
        }

        return el
    }

    throw new Error(`Invalid tagName => ${tagName}`)
}
