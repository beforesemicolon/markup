import fs from 'fs/promises'
import * as path from 'path'
import { toStatic } from '../src/to-static'

const docsSrcDir = path.resolve(process.cwd(), 'docs-src')
const docsDir = path.resolve(process.cwd(), 'docs')

fs.mkdir(docsDir, { recursive: true }).then(() =>
    handleDirectorySearch(docsSrcDir, docsDir)
)

function createPage(page: string, srcDir: string, targetDir: string) {
    const pageName = page.replace('.page.ts', '.html')
    import(path.join(srcDir, page)).then(async ({ default: temp }) => {
        await fs.mkdir(targetDir, { recursive: true })
        return fs.writeFile(path.join(targetDir, pageName), toStatic(temp))
    })
}

async function handleDirectorySearch(srcDir: string, targetDir: string) {
    const content = await fs.readdir(srcDir)
    content.forEach((c) => {
        if (!c.startsWith('.')) {
            const ext = path.extname(c)

            if (ext) {
                if (c.endsWith('page.ts')) {
                    createPage(c, srcDir, targetDir)
                }
            } else {
                handleDirectorySearch(
                    path.join(srcDir, c),
                    path.join(docsDir, c)
                )
            }
        }
    })
}
