import { isPrimitive } from './is-primitive'

export function jsonStringify<T>(value: T): string {
    if (!isPrimitive(value)) {
        try {
            return JSON.stringify(value)
        } catch (e) {
            /* empty */
        }
    }

    return String(value)
}
