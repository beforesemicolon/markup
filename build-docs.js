import { buildDocs } from '@beforesemicolon/builder'
import { copyFile, mkdir } from 'node:fs/promises'

const source = new URL('./docs/llms.txt', import.meta.url)
const target = new URL('./website/llms.txt', import.meta.url)

buildDocs()
    .then(async () => {
        await mkdir(new URL('./website', import.meta.url), { recursive: true })
        await copyFile(source, target)
    })
    .catch(console.error)
