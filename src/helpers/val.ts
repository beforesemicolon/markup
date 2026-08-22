/**
 * extracts the value of a Helper or a dynamic value (aka template functions)
 * @param x
 */
export function val<R>(x: R | (() => R)): R
export function val(x: unknown): unknown {
    return typeof x === 'function' ? x() : x
}
