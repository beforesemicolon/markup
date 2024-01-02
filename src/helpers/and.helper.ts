import { helper } from '../Helper'
import { StateGetter } from '../types'
import { val } from '../utils'

/**
 * checks if either a AND b value is truthy
 * @param a
 * @param b
 */
export const and = helper(
    <T, S>(a: T | StateGetter<T>, b: S | StateGetter<S>) => {
        return Boolean(val(a) && val(b))
    }
)
