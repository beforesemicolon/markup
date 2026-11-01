import assert from 'node:assert/strict'
import { buildModules, buildBrowser } from '@beforesemicolon/builder'
import { buildDocs } from '@beforesemicolon/site-builder'
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'

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

const browserWindow = {}
runInNewContext(await readFile('./dist/client.js', 'utf8'), {
    window: browserWindow,
})
assert.deepEqual(
    Object.keys(browserWindow.BFS.MARKUP).sort(),
    Object.keys(esm).sort(),
    'Built browser global must expose the complete ESM runtime API'
)
assert.equal(typeof browserWindow.BFS.MARKUP.visible, 'function')
assert.equal(typeof browserWindow.BFS.MARKUP.unsafeHTML, 'function')
