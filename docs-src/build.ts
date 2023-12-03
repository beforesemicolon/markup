import 'global-jsdom/register'
import { cp, mkdir, writeFile } from 'fs/promises'
import * as path from 'path'
import config, { DocMenu } from '../docs-src/config'
import { HtmlTemplate } from '../src'

const docsDir = path.resolve(process.cwd(), 'docs')
const docsSrcDir = path.resolve(process.cwd(), 'docs-src')

const toStatic = (temp: HtmlTemplate, docType = '<!doctype html>') => {
    document.body.innerHTML = ''
    temp.render(document.body)
    return docType + document.body.innerHTML.trim()
}

async function init() {
    // create docs dir
    await mkdir(docsDir, { recursive: true })
    // copy assets
    await cp(path.join(docsSrcDir, 'assets'), path.join(docsDir, 'assets'), {
        recursive: true,
    })
    // create pages
    await Promise.all(
        config.pages.map(async (page, index) => {
            const filePath = path.join(
                docsDir,
                page.path + (page.root ? 'index.html' : '.html')
            )
            const pageContent = toStatic(
                page.component({
                    name: config.name,
                    page,
                    prevPage: config.pages[index - 1],
                    nextPage: config.pages[index + 1],
                    docsMenu: DocMenu,
                })
            )
            const dir = filePath.replace(path.basename(filePath), '')
            await mkdir(dir, { recursive: true })
            return writeFile(filePath, pageContent)
        })
    )
}

init()
