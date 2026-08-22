import { buildModules, buildBrowser } from '@beforesemicolon/builder'
import { buildDocs } from '@beforesemicolon/site-builder'

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
