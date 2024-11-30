export const parseDynamicRawValue = (str: string) => {
    const pattern = /\$val([0-9]+)/g,
        parts: Array<string | number> = []
    let match: RegExpExecArray | null = null,
        lastIndex = 0

    while ((match = pattern.exec(str)) !== null) {
        const [, idxStr] = match,
            part = str.slice(lastIndex, match.index),
            value = Number(idxStr)

        if (part) {
            parts.push(part)
        }

        parts.push(value)

        lastIndex = pattern.lastIndex
    }

    if (lastIndex) {
        const lastPart = str.slice(lastIndex)

        if (lastPart) {
            parts.push(lastPart)
        }
    } else if (str) {
        parts.push(str)
    }

    return parts
}
