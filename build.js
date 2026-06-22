import { buildModules, buildBrowser, buildDocs } from '@beforesemicolon/builder'
import { renderCodeBlock } from './docs/_layouts/_code-snippet.js'

Promise.all([
    buildBrowser(),
    buildModules(),
    buildDocs({
        markedOptions: {
            renderer: {
                code({ lang, raw }) {
                    const rawCode = raw
                        .replace(/^\s*```[^\n]*\n/, '')
                        .replace(/\n\s*```\s*$/, '')
                    return renderCodeBlock('snippet', rawCode, lang)
                },
            },
        },
    }),
]).catch(console.error)
