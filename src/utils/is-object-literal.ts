export const isObjectLiteral = (val: unknown) => {
    return (
        val &&
        typeof val === 'object' &&
        Object.getPrototypeOf(val) === Object.prototype
    )
}
