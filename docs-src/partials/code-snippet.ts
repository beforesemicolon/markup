import hljs from 'highlight.js'
import { html, element } from '../../src'

export const CodeSnippet = (snippet: string, lang: string = 'vim') => {
    const el = element('code', {
        attributes: {
            class: `language-${lang} theme-hybrid`,
        },
        textContent: snippet,
    })

    hljs.highlightElement(el)

    return html`<div class="code-snippet"><pre>${el}</pre></div>`
}
