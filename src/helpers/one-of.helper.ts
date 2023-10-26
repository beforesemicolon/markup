import { helper } from '../Helper'
import { StateGetter } from '../types'

/**
 * check if the state value is inside the provided list of options
 * @param st
 * @param list
 */
export const oneOf = helper(<T>(st: StateGetter<T>, list: unknown[]) => {
    return list.includes(st())
})
