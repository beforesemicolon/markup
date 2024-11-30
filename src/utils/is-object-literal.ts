export const isObjectLiteral = (val: unknown) => {
    return Boolean(
        val &&
            typeof val === 'object' &&
            Object.getPrototypeOf(val) === Object.prototype
    )
}
