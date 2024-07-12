export const parseDynamicRawValue = (
    str: string,
    values: unknown[],
    cb?: (part: unknown) => void
) => {
    const pattern = /\$val([0-9]+)/g,
        parts: unknown[] = []
    let match: RegExpExecArray | null = null,
        lastIndex = 0

    while ((match = pattern.exec(str)) !== null) {
        const [, idxStr] = match,
            part = str.slice(lastIndex, match.index),
            idx = Number(idxStr),
            value = values[idx]

        if (part) {
            parts.push(part)
            cb?.(part)
        }

        if (values.hasOwnProperty(idx)) {
            parts.push(value)
            cb?.(value)
        }

        lastIndex = pattern.lastIndex
    }

    if (lastIndex) {
        const lastPart = str.slice(lastIndex)

        if (lastPart) {
            parts.push(lastPart)
            cb?.(lastPart)
        }
    } else if (str) {
        parts.push(str)
        cb?.(str)
    }

    return parts
}
