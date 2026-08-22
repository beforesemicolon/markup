import { buildModules, buildBrowser } from '@beforesemicolon/builder'
import { buildDocs } from '@beforesemicolon/site-builder'
import { writeFile } from 'node:fs/promises'

const run = async () => {
    try {
        await Promise.all([buildBrowser(), buildModules(), buildDocs()])
        await writeFile(
            'dist/cjs/package.json',
            '{\n    "type": "commonjs"\n}\n'
        )
    } catch (e) {
        console.error(e)
        process.exitCode = 1
    }
}

run()
