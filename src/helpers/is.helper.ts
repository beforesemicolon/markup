import {
    StateGetter,
    AnythingButAFunction,
    HelperValueChecker,
} from '../types.ts'
import { val } from './val.ts'

/**
 * checks whether the state value is equal to provided value or return value of the function checker
 * @param st
 * @param dataOrCheckerFn
 */
export const is =
    <T>(
        st: T | StateGetter<T>,
        dataOrCheckerFn: HelperValueChecker<T> | AnythingButAFunction<T>
    ) =>
    () => {
        const value = val<T>(st)

        if (typeof dataOrCheckerFn === 'function') {
            return Boolean((dataOrCheckerFn as HelperValueChecker<T>)(value))
        }

        if (dataOrCheckerFn instanceof RegExp) {
            return dataOrCheckerFn.test(String(value))
        }

        return value === dataOrCheckerFn
    }
