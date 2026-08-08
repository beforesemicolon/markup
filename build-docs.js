import { buildDocs } from '@beforesemicolon/site-builder'
import fs from 'fs'
import path from 'path'

const run = async () => {
    try {
        fs.rmSync(path.join(process.cwd(), 'website'), {
            recursive: true,
            force: true,
        })

        await buildDocs()
    } catch (e) {
        console.error(e)
    }
}

run()
