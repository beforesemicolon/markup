export class Helper<T extends (...args: Array<unknown>) => unknown> {
    #nestedFn: unknown = null

    constructor(
        public handler: T,
        public args: Array<unknown>
    ) {
        Object.freeze(this)
    }

    get value(): unknown {
        if (typeof this.#nestedFn === 'function') {
            return this.#nestedFn()
        }

        const res = this.handler(...this.args)

        if (typeof res === 'function') {
            this.#nestedFn = res
            return res()
        }

        return res
    }
}

export const helper = <T>(handler: T) =>
    ((...args: Array<unknown>) => {
        return new Helper(handler as (...args: Array<unknown>) => void, args)
    }) as typeof handler
