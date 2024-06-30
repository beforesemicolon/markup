import { isPrimitive } from './is-primitive'

const handleLastPart = (parts: unknown[], str: string) => {
    if (typeof parts.at(-1) === 'string') {
        parts[parts.length - 1] += str
    } else {
        parts.push(str)
    }
}

export const parseDynamicRawValue = (str: string, values: unknown[]) => {
    const pattern = /\$val([0-9]+)/g,
        parts: unknown[] = []
    let match: RegExpExecArray | null = null,
        lastIndex = 0

    while ((match = pattern.exec(str)) !== null) {
        const [, idx] = match,
            part = str.slice(lastIndex, match.index),
            value = values[Number(idx)]

        if (isPrimitive(value) || value === null) {
            handleLastPart(parts, part + value)
        } else {
            part && parts.push(part)
            parts.push(value)
        }

        lastIndex = pattern.lastIndex
    }

    const lastPart = str.slice(lastIndex)

    if (lastPart) {
        handleLastPart(parts, lastPart)
    }

    return parts
}
