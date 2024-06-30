import { val } from '../utils/val'

/**
 * checks if at least one of the values is truthy
 * @param values
 * @returns {boolean}
 */
export const or = (...values: Array<unknown>) => {
    if (values.length < 2)
        throw new Error('The "or" helper requires at least two arguments.')

    return () => values.some((x) => Boolean(val(x)))
}
