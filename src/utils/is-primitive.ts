export const isPrimitive = (val: unknown) => {
    return (
        val === null ||
        /undefined|number|string|bigint|boolean|symbol/.test(typeof val)
    )
}
