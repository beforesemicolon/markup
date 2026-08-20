import { html, HtmlTemplate } from '../html.ts'
import { normalizeContent } from './normalize-content.ts'

describe('normalizeContent', () => {
    it('should preserve nodes and templates', () => {
        const node = document.createElement('span')
        const template = html`<p>sample</p>`

        expect(normalizeContent([node, template])).toEqual([node, template])
    })

    it('should convert primitive values to text nodes', () => {
        const [text] = normalizeContent(12)

        expect(text).toBeInstanceOf(Text)
        expect((text as Text).nodeValue).toBe('12')
    })

    it('should flatten one array level only', () => {
        const template = html`<p>sample</p>`
        const result = normalizeContent(['a', template, ['b', 'c']])

        expect(result).toHaveLength(3)
        expect((result[0] as Text).nodeValue).toBe('a')
        expect(result[1]).toBeInstanceOf(HtmlTemplate)
        expect((result[2] as Text).nodeValue).toBe('b,c')
    })
})
