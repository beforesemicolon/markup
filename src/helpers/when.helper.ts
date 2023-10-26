import { helper } from '../Helper'
import { val } from '../utils/val'
import { StateGetter } from '../types'

/**
 * conditionally render second and third argument value based on the first argument condition
 * @param condition
 * @param thenThis
 * @param elseThat
 */
export const when = helper(
    <C, T, E>(condition: C | StateGetter<C>, thenThis: T, elseThat?: E) => {
        let truthValue: T | null = null
        let truthValueSet = false
        let falseValue: E | null = null
        let falseValueSet = false

        return () => {
            const shouldRender = val(condition)

            if (shouldRender) {
                if (!truthValueSet) {
                    truthValue =
                        typeof thenThis === 'function' ? thenThis() : thenThis
                    truthValueSet = true
                }

                return val(truthValue)
            }

            if (!falseValueSet) {
                falseValue =
                    elseThat === undefined
                        ? ''
                        : typeof elseThat === 'function'
                        ? elseThat()
                        : elseThat
                falseValueSet = true
            }

            return val(falseValue)
        }
    }
)
