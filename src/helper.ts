export class Helper<T> {
    nestedFn: null | (() => unknown) = null

    constructor(
        public handler: T,
        public args: Array<unknown>
    ) {
        Object.seal(this)
    }
}

export const helper = <T>(handler: T) => {
    return ((...args: Array<unknown>) => {
        return new Helper(handler, args)
    }) as typeof handler
}
