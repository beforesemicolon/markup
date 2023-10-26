import { helper } from '../Helper'
import { StateGetter } from '../types'
import { val } from '../utils/val'

/**
 * checks if either a OR b value is truthy
 * @param a
 * @param b
 */
export const or = helper(<T>(a: T | StateGetter<T>, b: T | StateGetter<T>) => {
    return Boolean(val(a) || val(b))
})
