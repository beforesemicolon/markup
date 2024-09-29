import { Tokens } from 'marked'

export default function link({ href, text }: Tokens.Link) {
    return `<a href="${href
        .replace(/\.md/, '.html')
        .replace(/index\.html/, '')}">${text}</a>`
}
