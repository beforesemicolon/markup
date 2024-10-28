import { StateGetter } from '../types.ts'
import { val } from './val.ts'

/**
 * check if the state value is inside the provided list of options
 * @param st
 * @param list
 */
export const oneOf =
    <T>(st: T | StateGetter<T>, list: unknown[]) =>
    () =>
        list.includes(val(st))
