export const setNodeEventListener = (
    name: string,
    rawValue: string,
    values: unknown[],
    node: Element | DocumentFragment
) => {
    const eventHandler = values[0] as EventListenerOrEventListenerObject

    if (typeof eventHandler !== 'function') {
        throw new Error(
            `Handler for event "${name}" is not a function. Found "${values[0]}".`
        )
    }

    let option = values[1] as AddEventListenerOptions

    if (option == undefined) {
        const rawOpt = rawValue.split(',')[1]

        if (rawOpt) {
            try {
                option = JSON.parse(rawOpt)
            } catch (e) {
                // ignore
            }
        }
    }

    node.addEventListener(name.slice(2), eventHandler, option)
}
