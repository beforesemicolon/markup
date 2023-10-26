import { helper } from '../Helper'
import { StateGetter } from '../types'

/**
 * given a dot separated string key it will try to get deep value from an object literal or array
 * @param st
 * @param key
 */
export const pick = helper(
    <T extends Record<keyof T, T[keyof T]> | Array<unknown>, R>(
        st: T | StateGetter<T>,
        key: string
    ): R => {
        const keyParts = String(key).split('.').filter(Boolean)

        const val = typeof st === 'function' ? st() : st

        return (
            val
                ? keyParts.reduce((acc, k) => {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore impossible to know the value
                      return acc ? acc[k] : undefined
                  }, val)
                : ''
        ) as R
    }
)
