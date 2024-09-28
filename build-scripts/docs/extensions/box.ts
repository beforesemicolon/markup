import { MarkedExtension } from 'marked'

export default {
    name: 'box',
    level: 'block',
    start(src: string) {
        return src.match(/^--|/)?.index
    },
    tokenizer(src, tokens) {
        const rule = /^--|(.*)/ // Regex for the complete token, anchor to string start
        const match = rule.exec(src)
        if (match) {
            console.log('-- tokenizer', match, src)
            const token = {
                type: 'box', // Should match "name" above
                raw: match[0], // Text to consume from the source
                text: match[0].trim(), // Additional custom properties
                tokens: [], // Array where child inline tokens will be generated
            }
            this.lexer.inline(token.text, token.tokens) // Queue this data to be processed for inline tokens
            return token
        }
    },
    renderer(token) {
        console.log('-- renderer', token)
        return `<div></div>`
    },
} as MarkedExtension
