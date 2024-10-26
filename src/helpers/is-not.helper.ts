import { StateGetter, AnythingButAFunction, HelperValueChecker } from '../types'
import { is } from './is.helper'

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
        !is(st, checker)()
