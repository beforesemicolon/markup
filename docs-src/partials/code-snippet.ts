import hljs from 'highlight.js'
import { html, element } from '../../src'

export const CodeSnippet = (snippet: string, lang: string = 'vim') => {
    const el = element('code', {
        attributes: {
            class: `language-${lang} theme-hybrid`,
        },
        textContent: snippet,
    })

    hljs.highlightElement(el as HTMLElement)

    return html`<div class="code-snippet">
        <div class="content">
            <pre>${el}</pre>
        </div>
        <button type="button" class="code-copy-btn" style="visibility: hidden">
            copy
        </button>
    </div>`
}
