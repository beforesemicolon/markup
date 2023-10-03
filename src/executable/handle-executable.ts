import { Executable, ExecutableValue } from '../types'
import {
    jsonParse,
    isObjectLiteral,
    isPrimitive,
    jsonStringify,
    turnKebabToCamelCasing,
} from '../utils'
import { handleTextExecutable } from './handle-text-executable'
import { handleAttrDirectiveExecutable } from './handle-attr-directive-executable'
import { HtmlTemplate } from '../html'
import { Helper } from '../helper'

const partsToValue = (
    parts: unknown[],
    handler: null | ((p: unknown) => unknown) = null
) =>
    parts.flatMap((p) => {
        if (typeof p === 'function') {
            return p()
        } else if (p instanceof Helper) {
            if (typeof p.nestedFn === 'function') {
                return p.nestedFn()
            }

            const res = p.handler(...p.args)

            if (typeof res === 'function') {
                p.nestedFn = res
                return res()
            }

            return res
        }

        if (typeof handler === 'function') {
            return handler(p)
        }

        return p
    })

export const handleExecutable = (
    node: Node,
    executable: Executable,
    refs: Record<string, Set<Element>>
) => {
    executable.events.forEach((e) => {
        handleEventExecutableValue(e)
    })
    executable.directives.forEach((d) => {
        handleAttrDirectiveExecutableValue(d)
    })
    executable.attributes.forEach((a) => {
        handleAttrExecutableValue(a, a.renderedNodes[0] as Element)
    })
    executable.content.forEach((t) => {
        handleTextExecutableValue(t, refs, node)
    })
}

export function handleAttrDirectiveExecutableValue(val: ExecutableValue) {
    const value = jsonParse(
        partsToValue(val.parts, (p) => {
            // want to remove the value-condition separator
            if (typeof p === 'string' && /^[|,]$/.test(p.trim())) {
                return ''
            }

            return p
        }).join('')
    )

    if (val.value !== value) {
        handleAttrDirectiveExecutable(val, value)
    }
}

export function handleEventExecutableValue(val: ExecutableValue) {
    const eventHandler = val.parts[0] as EventListenerOrEventListenerObject

    if (typeof eventHandler !== 'function') {
        throw new Error(
            `handler for event "${val.name}" is not a function. Found "${eventHandler}".`
        )
    }

    if (val.value !== eventHandler) {
        val.value = eventHandler
        const node = Array.isArray(val.renderedNodes)
            ? (val.renderedNodes as Node[])[0]
            : (val.renderedNodes as Node)
        const eventName = val.prop as string
        const option =
            val.parts.length > 1
                ? val.parts[2]
                : jsonParse(val.rawValue.split(',')[1])
        const validOption =
            typeof option === 'boolean' || isObjectLiteral(option)
        const eventOption = (
            validOption ? option : undefined
        ) as AddEventListenerOptions

        if (typeof val.value === 'function') {
            node.removeEventListener(eventName, eventHandler, eventOption)
        }

        node.addEventListener(eventName, eventHandler, eventOption)
    }
}

export function handleAttrExecutableValue(val: ExecutableValue, node: Element) {
    const value =
        val.parts.length > 1
            ? jsonParse(partsToValue(val.parts, jsonStringify).join(''))
            : jsonParse(partsToValue(val.parts)[0] as string)

    if (value !== val.value) {
        val.value = value

        try {
            // always update the element attribute
            node.setAttribute(val.name, jsonStringify(value))
            // for WC we can also use the setter to set the value in case they
            // have correspondent camel case property version of the attribute
            // we do this only for non-primitive value because they are not handled properly
            // by elements and if in case they have such setters, we can use them to set it
            if (
                customElements.get(node.nodeName.toLowerCase()) &&
                !isPrimitive(value)
            ) {
                const propName = /-/.test(val.name)
                    ? turnKebabToCamelCasing(val.name)
                    : val.name
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore check if value is different from the new value
                if (node[propName] !== value) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore in case the property is not writable and throws error
                    node[propName] = value
                }
            } else {
                if (
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore handle cases like input field which changing attribute does not
                    // actually change the value of the input field, and we check this by
                    // verifying that the matching property value remained different from the new value of the attribute
                    node[val.name] !== undefined &&
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    node[val.name] !== value
                ) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    node[val.name] = value
                }
            }
        } catch (e) {
            /* empty */
        }
    }
}

export function handleTextExecutableValue(
    val: ExecutableValue,
    refs: Record<string, Set<Element>>,
    el: Node
) {
    const value = partsToValue(val.parts)
    const nodes: Array<Node> = []

    let idx = 0
    for (const v of value as Array<Node | HtmlTemplate | string>) {
        if (v instanceof HtmlTemplate) {
            const renderedBefore = v.renderTarget !== null

            if (!renderedBefore) {
                v.render(document.createElement('div'))
                // need to disconnect these nodes because the div created above
                // is only used ,so we can get access to the nodes but not necessarily
                // where we want these nodes to be rendered at
                v.nodes.forEach((node) => {
                    node.parentNode?.removeChild(node)
                })
            } else {
                // could be that the component was sitting around while data changed
                // for that we need to update it, so it has the latest data
                v.update()
            }

            // collect dynamic refs that could appear
            // after render/update
            Object.entries(v.refs).forEach(([name, els]) => {
                els.forEach((el) => {
                    if (!refs[name]) {
                        refs[name] = new Set()
                    }

                    refs[name].add(el)
                })
            })

            nodes.push(...v.nodes)
        } else if (v instanceof Node) {
            nodes.push(v)
        } else {
            // need to make sure to grab the same text node that was already rendered
            // to avoid unnecessary DOM updates
            if (
                Array.isArray(val.value) &&
                Array.isArray(el) &&
                String(val.value[idx]) === String(v)
            ) {
                nodes.push(el[idx])
            } else {
                nodes.push(document.createTextNode(String(v)))
            }
        }

        idx += 1
    }

    val.value = value

    // need to make sure nodes array does not have repeated nodes
    // which cannot be rendered in 2 places at once
    handleTextExecutable(val, Array.from(new Set(nodes)), el)
}
