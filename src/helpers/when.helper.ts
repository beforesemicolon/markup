import { val } from '../utils/val'
import { StateGetter } from '../types'

/**
 * conditionally render second and third argument value based on the first argument condition
 * @param condition
 * @param thenThis
 * @param elseThat
 */
export const when = <C, T, E>(
    condition: C | StateGetter<C>,
    thenThis: T,
    elseThat?: E
) => {
    return () => {
        const shouldRender = val<C>(condition)

        if (shouldRender) {
            return val(val(thenThis))
        }

        return val(val(elseThat)) ?? ''
    }
}
