import {
    StateGetter,
    AnythingButAFunction,
    HelperValueChecker,
} from '../types.ts'
import { val } from './val.ts'

/**
 * checks whether the state value is equal to provided value or return value of the function checker
 * @param st
 * @param checker
 */
export const is =
    <T>(
        st: T | StateGetter<T>,
        checker: HelperValueChecker<T> | AnythingButAFunction<T>
    ) =>
    () =>
        typeof checker === 'function'
            ? Boolean((checker as HelperValueChecker<T>)(val(st)))
            : val(st) === checker
