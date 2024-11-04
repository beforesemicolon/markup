import { setElementAttribute } from '../utils/set-element-attribute.ts'
import { turnCamelToKebabCasing } from '../utils/turn-camel-to-kebab-casing.ts'
import { ElementOptions } from '../types.ts'

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
        childNodes = [],
        ns = 'http://www.w3.org/1999/xhtml',
    }: ElementOptions<A> = {}
) => {
    if (tagName) {
        const Comp = customElements.get(tagName)
        const el = Comp ? new Comp() : document.createElementNS(ns, tagName)

        if (attributes) {
            for (const [key, val] of Object.entries(
                attributes as Record<string, unknown>
            )) {
                if (/^on[a-z]+/g.test(key)) {
                    typeof val === 'function' &&
                        el.addEventListener(
                            key.slice(2).toLowerCase(),
                            val as EventListenerOrEventListenerObject
                        )
                } else {
                    setElementAttribute(el, turnCamelToKebabCasing(key), val)
                }
            }
        }

        if (textContent) {
            el.textContent = textContent
        } else if (htmlContent) {
            el.innerHTML = htmlContent
        } else if (childNodes) {
            el.append(...childNodes)
        }

        return el
    }

    throw new Error(`Invalid tagName => ${tagName}`)
}
