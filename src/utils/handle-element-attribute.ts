import { setNodeEventListener } from './set-node-event-listener'
import { EffectUnSubscriber } from '../types'
import { parseDynamicRawValue } from './parse-dynamic-raw-value'
import { booleanAttributes } from './boolean-attributes'
import { val } from './val'
import { setElementAttribute } from './set-element-attribute'
import { effect } from '../state'

function handleElementEventListener(
    node: Element,
    name: string,
    value: string,
    values: unknown[]
) {
    const comp = customElements.get(node.nodeName.toLowerCase())

    if (
        // @ts-expect-error observedAttributes is property of web component
        (comp && !comp?.observedAttributes?.includes(name)) ||
        (document.head &&
            // @ts-expect-error check if know event name
            typeof document.head[name] !== 'undefined')
    ) {
        const [fnString, optString] = value.split(',').map((p) => p.trim())
        const [, idx] = fnString.match(/\$val([0-9]+)/) ?? []
        const fn = values[Number(idx)]
        let options: boolean | AddEventListenerOptions | undefined

        if (optString) {
            if (/^(true|false)$/.test(optString)) {
                options = /^true$/.test(optString)
            } else {
                const [, oIdx] = optString.match(/\$val([0-9]+)/g) ?? []
                options = values[Number(oIdx)] as AddEventListenerOptions
            }
        }

        setNodeEventListener(node, name, fn as EventListener, options)
        return true
    }

    return false
}

export function handleElementAttribute(
    node: Element,
    name: string,
    value: string,
    refs: Record<string, Set<Element>> = {},
    values: unknown[],
    cb: (item: EffectUnSubscriber) => void
) {
    const trimmedValue = value.trim()

    if (trimmedValue) {
        if (name === 'ref') {
            if (!refs[trimmedValue]) {
                refs[trimmedValue] = new Set()
            }

            refs[trimmedValue].add(node)
            return
        }

        if (/^on[a-z]+/.test(name)) {
            const set = handleElementEventListener(
                node,
                name,
                trimmedValue,
                values
            )

            if (set) {
                node.removeAttribute(name)
                return
            }
        }

        let hasFunctionValue = false
        const dvValue = parseDynamicRawValue(trimmedValue, values, (d) => {
            hasFunctionValue = !hasFunctionValue && typeof d === 'function'
        })

        if (booleanAttributes[name.toLowerCase()]) {
            const d = dvValue[0]

            const setAttr = () => {
                const v = val(d)
                if (v) {
                    setElementAttribute(node, name, v)
                } else {
                    ;(node as Element).removeAttribute(name)
                }
            }

            if (typeof d === 'function') {
                return cb(effect(setAttr))
            }

            return setAttr()
        }

        const setAttr = () =>
            setElementAttribute(
                node,
                name,
                dvValue.length === 1
                    ? val(dvValue[0])
                    : dvValue.map((d) => val(d)).join('')
            )

        if (hasFunctionValue) {
            return cb(effect(setAttr))
        }

        return setAttr()
    }

    if (name !== 'ref') {
        setElementAttribute(node as HTMLElement, name, trimmedValue)
    }
}
