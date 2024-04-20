import { isObjectLiteral, jsonParse } from '../utils'
import { DynamicValueResolver } from './DynamicValueResolver'

export class EventDynamicValueResolver extends DynamicValueResolver<
    unknown[],
    EventListener
> {
    resolve() {
        const eventHandler = this.value.find(
            (p) => typeof p === 'function'
        ) as EventListenerOrEventListenerObject

        if (typeof eventHandler !== 'function') {
            throw new Error(
                `handler for event "${this.name}" is not a function. Found "${this.value[0]}".`
            )
        }

        if (this.data !== eventHandler) {
            const node = this.renderedNodes[0]
            const option =
                this.value.length > 1
                    ? this.value.find(
                          (p) => typeof p === 'boolean' || isObjectLiteral(p)
                      )
                    : jsonParse(this.rawValue.split(',')[1])

            node.addEventListener(
                this.prop as string,
                eventHandler,
                option as AddEventListenerOptions
            )

            this.data = eventHandler
        }
    }
}
