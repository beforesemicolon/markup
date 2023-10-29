import hljs from 'highlight.js'
import { html } from '../../src'

export const CodeSnippet = (snippet: string, lang: string = 'vim') => {
    const code = hljs.highlight(snippet, { language: lang })

    return html`
        <div class="code-snippet">
            <pre><code class="language-${lang} theme-hybrid">
              ${html([
                code.value
                    .trim()
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"'),
            ])}
            </code></pre>
        </div>
    `
}
