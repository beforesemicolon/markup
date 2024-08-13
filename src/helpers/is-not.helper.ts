import { StateGetter, AnythingButAFunction, HelperValueChecker } from '../types'
import { val } from './val'

/**
 * checks whether the state value is NOT equal to provided value or return value of the function checker
 * @param st
 * @param checker
 */
export const isNot =
    <T>(
        st: T | StateGetter<T>,
        checker: HelperValueChecker<T> | AnythingButAFunction<T>
    ) =>
    () =>
        typeof checker === 'function'
            ? !(checker as HelperValueChecker<T>)(val(st))
            : val(st) !== checker
