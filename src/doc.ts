function check(it: unknown) {
    // Math is known to exist as a global in every environment.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return it && it.Math === Math && it
}

export const doc = (
    check(typeof window === 'object' && window) ||
    check(typeof self === 'object' && self) ||
    check(typeof global === 'object' && global) ||
    // This returns undefined when running in strict mode
    (function () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this
    })() ||
    Function('return this')()
).document
