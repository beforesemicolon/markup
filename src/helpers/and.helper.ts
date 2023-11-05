import { helper } from '../Helper'
import { StateGetter } from '../types'
import { val } from '../utils'

/**
 * checks if either a AND b value is truthy
 * @param a
 * @param b
 */
export const and = helper(<T>(a: T | StateGetter<T>, b: T | StateGetter<T>) => {
    return Boolean(val(a) && val(b))
})
