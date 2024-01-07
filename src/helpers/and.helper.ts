import { helper } from '../Helper'
import { val } from '../utils'

/**
 * checks if all values are truthy
 * @param values
 * @returns {boolean}
 */
export const and = helper((...values: Array<unknown>) => {
    if (values.length < 2)
        throw new Error('The "and" helper requires at least two arguments.')

    return values.every((x) => Boolean(val(x)))
})
