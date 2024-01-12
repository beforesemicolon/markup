import { Executable, ExecutableValue } from '../types'
import {
    jsonParse,
    isObjectLiteral,
    isPrimitive,
    jsonStringify,
    turnKebabToCamelCasing,
    val,
    setElementAttribute,
} from '../utils'
import { handleTextExecutable } from './handle-text-executable'
import { handleAttrDirectiveExecutable } from './handle-attr-directive-executable'
import { HtmlTemplate } from '../html'

const partsToValue = (
    parts: unknown[],
    handler: null | ((p: unknown) => unknown) = null
) =>
    parts.flatMap((p) => {
        if (typeof handler === 'function') {
            return handler(val(p))
        }

        return val(p)
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
    const value = partsToValue(val.parts, jsonStringify).join('')

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

export function handleAttrExecutableValue(
    eVal: ExecutableValue,
    node: Element
) {
    let rawValue = val(eVal.parts[0])

    if (isPrimitive(rawValue)) {
        rawValue = partsToValue(eVal.parts, jsonStringify).join('')
    }

    const value = jsonStringify(rawValue)

    if (rawValue !== eVal.value) {
        eVal.value = rawValue

        try {
            // always update the element attribute
            setElementAttribute(node, eVal.name, value)
            // for WC we can also use the setter to set the value in case they
            // have correspondent camel case property version of the attribute
            // we do this only for non-primitive value because they are not handled properly
            // by elements and if in case they have such setters, we can use them to set it
            if (
                customElements.get(node.nodeName.toLowerCase()) &&
                !isPrimitive(rawValue)
            ) {
                const propName = /-/.test(eVal.name)
                    ? turnKebabToCamelCasing(eVal.name)
                    : eVal.name
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore check if value is different from the new value
                if (node[propName] !== rawValue) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore in case the property is not writable and throws error
                    node[propName] = rawValue
                }
            } else {
                if (
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore handle cases like input field which changing attribute does not
                    // actually change the value of the input field, and we check this by
                    // verifying that the matching property value remained different from the new value of the attribute
                    node[eVal.name] !== undefined &&
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    node[eVal.name] !== rawValue
                ) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    node[eVal.name] = rawValue
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
    const value = partsToValue(val.parts) as Array<Node | HtmlTemplate | string>
    const nodes: Array<Node> = []

    for (let i = 0; i < value.length; i++) {
        const v = value[i]

        if (v instanceof HtmlTemplate) {
            const renderedBefore = v.renderTarget !== null

            if (renderedBefore) {
                // could be that the component was sitting around while data changed
                // for that we need to update it, so it has the latest data
                v.update()
            } else {
                v.render(document.createElement('div'))
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
                String(val.value[i]) === String(v)
            ) {
                nodes.push(val.renderedNodes[i])
            } else {
                nodes.push(document.createTextNode(String(v)))
            }
        }
    }

    // need to make sure nodes array does not have repeated nodes
    // which cannot be rendered in 2 places at once
    handleTextExecutable(val, Array.from(new Set(nodes)), el)

    // clean up templates removed by unmounting them
    if (Array.isArray(val.value)) {
        const valueSet = new Set(value)

        for (const v of val.value as unknown[]) {
            if (v instanceof HtmlTemplate && !valueSet.has(v)) {
                v.unmount()
            }
        }
    }

    val.value = value
}
