export const turnCamelToKebabCasing = (name: string) =>
    name
        .match(/(?:[A-Z]+(?=[A-Z][a-z])|[A-Z]+|[a-zA-Z])[^A-Z]*/g)
        ?.map((p) => p.toLowerCase())
        .join('-') ?? name
