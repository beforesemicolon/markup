export default function heading({
    tokens,
    depth,
}: {
    tokens: string
    depth: string
}) {
    // @ts-expect-error this
    const text = this.parser.parseInline(tokens)
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')

    return `<h${depth} id="${escapedText}"><a href="#${escapedText}">${text}</a></h${depth}>`
}
