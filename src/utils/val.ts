import { Helper } from '../Helper'

/**
 * extracts the value of a Helper or a dynamic value (aka template functions)
 * @param x
 */
export const val = (x: unknown) =>
    x instanceof Helper ? x.value : typeof x === 'function' ? x() : x
