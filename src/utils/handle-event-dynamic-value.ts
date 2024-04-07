import { jsonParse } from './json-parse'
import { isObjectLiteral } from './is-object-literal'
import { DynamicValue } from '../types'

export function handleEventDynamicValue(dv: DynamicValue<Array<unknown>>) {
    const eventHandler = dv.value.find(
        (p) => typeof p === 'function'
    ) as EventListenerOrEventListenerObject

    if (typeof eventHandler !== 'function') {
        throw new Error(
            `handler for event "${dv.name}" is not a function. Found "${dv.value[0]}".`
        )
    }

    if (dv.data !== eventHandler) {
        const node = dv.renderedNodes[0]
        const option =
            dv.value.length > 1
                ? dv.value.find(
                      (p) => typeof p === 'boolean' || isObjectLiteral(p)
                  )
                : jsonParse(dv.rawValue.split(',')[1])

        node.addEventListener(
            dv.prop as string,
            eventHandler,
            option as AddEventListenerOptions
        )

        dv.data = eventHandler
    }
}
