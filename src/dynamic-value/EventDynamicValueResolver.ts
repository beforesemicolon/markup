import { DynamicValueResolver } from './DynamicValueResolver'

export class EventDynamicValueResolver extends DynamicValueResolver<
    unknown[],
    EventListener
> {
    resolve() {
        const eventHandler = this.value[0] as EventListenerOrEventListenerObject

        if (typeof eventHandler !== 'function') {
            throw new Error(
                `handler for event "${this.name}" is not a function. Found "${this.value[0]}".`
            )
        }

        if (this.data !== eventHandler) {
            const node = this.renderedNodes[0]
            let option = this.value[1]

            if (option == undefined) {
                const rawOpt = this.rawValue.split(',')[1]

                if (rawOpt) {
                    try {
                        option = JSON.parse(rawOpt)
                    } catch (e) {
                        // ignore
                    }
                }
            }

            node.addEventListener(
                this.prop as string,
                eventHandler,
                option as AddEventListenerOptions
            )

            this.data = eventHandler
        }
    }
}
