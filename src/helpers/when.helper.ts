import { Helper, helper } from '../helper'

export const when = helper(
    <C, T, E>(condition: C, thenThis: T, elseThat?: E) => {
        let truthValue: T | null = null
        let truthValueSet = false
        let falseValue: E | null = null
        let falseValueSet = false

        return () => {
            let shouldRender =
                typeof condition === 'function' ? condition() : condition

            if (shouldRender instanceof Helper) {
                shouldRender = shouldRender.value as boolean
            }

            if (shouldRender) {
                if (!truthValueSet) {
                    truthValue =
                        typeof thenThis === 'function' ? thenThis() : thenThis
                    truthValueSet = true
                }

                if (truthValue instanceof Helper) {
                    return truthValue.value
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

            if (falseValue instanceof Helper) {
                return falseValue.value
            }

            return falseValue
        }
    }
)
