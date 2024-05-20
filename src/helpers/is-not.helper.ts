import { StateGetter, AnythingButAFunction, HelperValueChecker } from '../types'
import { val } from '../utils'
import { compute } from '../compute'

/**
 * checks whether the state value is NOT equal to provided value or return value of the function checker
 * @param st
 * @param checker
 */
export const isNot =
    compute(<T>(
        st: T | StateGetter<T>,
        checker: HelperValueChecker<T> | AnythingButAFunction<T>
    ) =>
        typeof checker === 'function'
            ? !(checker as HelperValueChecker<T>)(val(st))
            : val(st) !== checker)

