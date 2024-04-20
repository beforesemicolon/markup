import { helper } from '../Helper'
import { StateGetter, AnythingButAFunction, HelperValueChecker } from '../types'
import { val } from '../utils'

/**
 * checks whether the state value is equal to provided value or return value of the function checker
 * @param st
 * @param checker
 */
export const is = helper(
    <T>(
        st: T | StateGetter<T>,
        checker: HelperValueChecker<T> | AnythingButAFunction<T>
    ) =>
        typeof checker === 'function'
            ? Boolean((checker as HelperValueChecker<T>)(val(st)))
            : val(st) === checker
)
