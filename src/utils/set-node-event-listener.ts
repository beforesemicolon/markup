export const setNodeEventListener = (
    node: Element | DocumentFragment,
    name: string,
    eventHandler?: EventListenerOrEventListenerObject,
    option?: boolean | AddEventListenerOptions
) => {
    if (typeof eventHandler !== 'function') {
        throw new Error(
            `Handler for event "${name}" is not a function. Found "${eventHandler}".`
        )
    }

    node.addEventListener(name.slice(2), eventHandler, option)
}
