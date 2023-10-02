export function jsonParse<T>(value: T): T {
    if (value && typeof value === 'string') {
        try {
            value = JSON.parse(value.replace(/['`]/g, '"'))
        } catch (e) {
            /* empty */
        }
    }

    return value
}
