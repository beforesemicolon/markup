import { buildModules, buildBrowser } from '@beforesemicolon/builder'
import { buildDocs } from '@beforesemicolon/site-builder'
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

await Promise.all([
    buildBrowser({
        esbuildOptions: {
            keepNames: false,
            sourcemap: false,
        },
    }),
    buildModules({
        esbuildOptions: {
            keepNames: false,
        },
    }),
    buildDocs(),
])

await writeFile(
    new URL('./dist/cjs/package.json', import.meta.url),
    `${JSON.stringify({ type: 'commonjs' }, null, 4)}\n`
)

const esm = await import('./dist/esm/index.js')
const cjs = createRequire(import.meta.url)('./dist/cjs/index.js')

if (typeof esm.html !== 'function' || typeof cjs.html !== 'function') {
    throw new Error('Built ESM and CommonJS entry points must export html')
}
