import { StateGetter } from '../types.ts'
import { val } from './val.ts'

/**
 * given a dot separated string key it will try to get deep value from an object literal or array
 * @param st
 * @param key
 * @param mapper
 */
export const pick = <
    T extends Record<keyof T, T[keyof T]> | Array<unknown>,
    R = unknown,
    V = unknown,
>(
    st: T | StateGetter<T>,
    key: string,
    mapper?: (v: V) => R
): (() => R) => {
    const keyParts = String(key).split('.').filter(Boolean)

    return () => {
        const x = val(st)

        if (!x) {
            return '' as unknown as R
        }

        const extracted: unknown = keyParts.reduce((acc: unknown, k) => {
            if (acc && typeof acc === 'object') {
                return (acc as Record<string, unknown>)[k]
            }
            return undefined
        }, x as unknown)

        return mapper ? mapper(extracted as V) : (extracted as R)
    }
}
