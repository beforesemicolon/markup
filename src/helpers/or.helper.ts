import { val } from '../utils'
import { compute } from '../compute'

/**
 * checks if at least one of the values is truthy
 * @param values
 * @returns {boolean}
 */
export const or = compute((...values: Array<unknown>) => {
    if (values.length < 2)
        throw new Error('The "or" helper requires at least two arguments.')

    return values.some((x) => Boolean(val(x)))
})
