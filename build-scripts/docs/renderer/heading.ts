import { Tokens } from 'marked'

export default function heading({ tokens, depth }: Tokens.Heading) {
    const text = this.parser.parseInline(tokens)
    const escapedText = text
        .toLowerCase()
        .replace(/[^\w]+/g, ' ')
        .trim()
        .replace(/\s/g, '-')

    return `<h${depth} id="${escapedText}"><a href="#${escapedText}">${text}</a></h${depth}>`
}
