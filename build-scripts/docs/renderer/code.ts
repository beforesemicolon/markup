import { Tokens } from 'marked'

export default function code({ lang, text }: Tokens.Code) {
    return `<div class="code-snippet">
        <div class="label ${lang.toLowerCase()}">${lang}</div>
        <div class="content">
            <pre>
                <code class="hljs language-javascript">${text}</code>
            </pre>
        </div>
        <button type="button" class="code-copy-btn" style="visibility: hidden">
            copy
        </button>
    </div>`
}
