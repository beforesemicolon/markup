export const isPrimitive = (val: unknown) =>
    /undefined|number|string|bigint|boolean|symbol/.test(typeof val)
