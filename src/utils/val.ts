import { Helper } from '../Helper'

/**
 * extracts the value of a Helper or a dynamic value (aka template functions)
 * @param x
 */
export const val = <R>(x: unknown): R =>
    x instanceof Helper ? x.value : typeof x === 'function' ? x() : x
