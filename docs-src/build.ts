import fs from 'fs/promises'
import * as path from 'path'
import { toStatic } from '../src/to-static'
import config, { DocMenu } from '../docs-src/config'

const docsDir = path.resolve(process.cwd(), 'docs')

fs.mkdir(docsDir, { recursive: true }).then(() =>
    config.map(async (page, index) => {
        const filePath = path.join(
            docsDir,
            page.path + (page.root ? 'index.html' : '.html')
        )
        const pageContent = toStatic(
            page.component({
                page,
                prevPage: config[index - 1],
                nextPage: config[index + 1],
                docsMenu: DocMenu,
            })
        )
        const dir = filePath.replace(path.basename(filePath), '')
        await fs.mkdir(dir, { recursive: true })
        return fs.writeFile(filePath, pageContent)
    })
)
