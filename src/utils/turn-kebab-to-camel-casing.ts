export const turnKebabToCamelCasing = (name: string) => {
    if (!/-/.test(name)) {
        return name.toLowerCase()
    }

    const parts = name.split(/-+/)

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        parts[i] =
            i === 0 && part.length > 1
                ? part
                : part[0].toUpperCase() + part.slice(1)
    }

    return parts.join('')
}
