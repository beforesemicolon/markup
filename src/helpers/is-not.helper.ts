import {
    StateGetter,
    AnythingButAFunction,
    HelperValueChecker,
} from '../types.ts'
import { is } from './is.helper.ts'

/**
 * checks whether the state value is NOT equal to provided value or return value of the function checker
 * @param st
 * @param dataOrCheckerFn
 */
export const isNot =
    <T>(
        st: T | StateGetter<T>,
        dataOrCheckerFn: HelperValueChecker<T> | AnythingButAFunction<T>
    ) =>
    () =>
        !is(st, dataOrCheckerFn)()
