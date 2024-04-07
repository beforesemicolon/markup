import { isPrimitive } from './is-primitive'

const handleLastPart = (parts: unknown[], str: string) => {
    if (str) {
        if (typeof parts.at(-1) === 'string') {
            parts[parts.length - 1] += str
        } else {
            parts.push(str)
        }
    }
}

export const extractExecutableValueFromRawValue = (
    str: string,
    values: unknown[]
) => {
    const vals = Array.from(str.matchAll(/\$val([0-9]+)/g))

    if (!vals.length) {
        return [str]
    }

    const parts: (string | { value: unknown; text: string })[] = []
    let idx = 0

    for (const val of vals) {
        const prevVal = vals[idx - 1]
        const value = values[Number(val[0].match(/\d+/g))]
        const newPart = str.slice(
            prevVal ? (prevVal.index ?? 0) + prevVal[0].length : 0,
            val.index
        )

        if (isPrimitive(value) || value === null) {
            handleLastPart(parts, newPart + value)
        } else {
            newPart && parts.push(newPart)
            parts.push({ value, text: val[0] })
        }

        idx += 1
    }

    const lastVal = vals.at(-1)

    if (lastVal) {
        handleLastPart(
            parts,
            str.substring((lastVal.index ?? 0) + lastVal[0].length)
        )
    }

    return parts
}
