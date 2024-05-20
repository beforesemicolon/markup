import { StateGetter } from '../types'
import { val } from '../utils'
import { compute } from '../compute'

/**
 * check if the state value is inside the provided list of options
 * @param st
 * @param list
 */
export const oneOf = compute(<T>(st: T | StateGetter<T>, list: unknown[]) =>
    list.includes(val(st)))

