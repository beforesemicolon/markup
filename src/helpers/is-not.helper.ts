import { helper } from '../Helper'
import { StateGetter, AnythingButAFunction, HelperValueChecker } from '../types'
import { val } from '../utils'

/**
 * checks whether the state value is NOT equal to provided value or return value of the function checker
 * @param st
 * @param checker
 */
export const isNot = helper(
    <T>(
        st: StateGetter<T>,
        checker: HelperValueChecker<T> | AnythingButAFunction<T>
    ) => {
        return typeof checker === 'function'
            ? !(checker as HelperValueChecker<T>)(val(st))
            : val(st) !== checker
    }
)
