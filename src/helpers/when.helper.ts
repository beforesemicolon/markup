import { helper } from '../helper'

export const when = helper(
    <C, T, E>(condition: C, thenThis: T, elseThat?: E) => {
        let truthValue: T | null = null
        let truthValueSet = false
        let falseValue: E | null = null
        let falseValueSet = false

        return () => {
            const shouldRender = Boolean(
                typeof condition === 'function' ? condition() : condition
            )

            if (shouldRender) {
                if (!truthValueSet) {
                    truthValue =
                        typeof thenThis === 'function' ? thenThis() : thenThis
                    truthValueSet = true
                }

                return truthValue
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

            return falseValue
        }
    }
)
