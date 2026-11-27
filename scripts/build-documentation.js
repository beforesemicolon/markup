import { buildDocs } from '@beforesemicolon/site-builder'
import { build } from 'esbuild'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// The course runs this checkout's browser runtime under the docs site's CSP.
export async function buildDocumentation(options) {
    const [docs, runtime] = await Promise.all([
        buildDocs(options),
        build({
            entryPoints: ['src/client.ts'],
            bundle: true,
            format: 'iife',
            minify: true,
            write: false,
        }),
    ])
    const { contents } = runtime.outputFiles[0]
    await Promise.all(
        docs.locales.map((locale) =>
            writeFile(
                join(docs.publicDir, locale, 'assets/training/markup.js'),
                contents
            )
        )
    )
    return docs
}
