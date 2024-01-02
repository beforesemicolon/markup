import { helper } from '../Helper'
import { StateGetter } from '../types'
import { val } from '../utils'

/**
 * checks if either a OR b value is truthy
 * @param a
 * @param b
 */
export const or = helper(
    <T, S>(a: T | StateGetter<T>, b: S | StateGetter<S>) => {
        return Boolean(val(a) || val(b))
    }
)
