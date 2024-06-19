export const turnCamelToKebabCasing = (name: string) => {
    const match = name.match(/(?:[A-Z]+(?=[A-Z][a-z])|[A-Z]+|[a-zA-Z])[^A-Z]*/g)

    if (match) {
        for (let i = 0; i < match.length; i++) {
            match[i] = match[i].toLowerCase()
        }

        return match.join('-')
    }

    return name
}
