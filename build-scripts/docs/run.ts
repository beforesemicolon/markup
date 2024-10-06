import { marked, Marked, Lexer } from 'marked'
import { mkdir, readdir, readFile, writeFile, cp } from 'fs/promises'
import path from 'path'
import fm from 'front-matter'
import DOMPurify from 'isomorphic-dompurify'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import defaultTemp from './templates/default'
import { CustomOptions, PageProps, SiteMap } from './types'
import renderer from './renderer'

const siteMap: SiteMap = {}
const layouts: Map<string, (props: PageProps) => string> = new Map()

layouts.set('default', defaultTemp)

const marked = new Marked(
    markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext'
            return hljs.highlight(code, { language }).value
        },
    })
)

marked.use({ renderer })

const docsDir = path.resolve(process.cwd(), 'docs')
const docsSiteDir = path.resolve(process.cwd(), 'website')
const docsLayoutsDir = path.resolve(process.cwd(), 'docs/_layouts')
const docsAssetsDir = path.resolve(process.cwd(), 'docs/assets')
const docsStylesheetsDir = path.resolve(process.cwd(), 'docs/stylesheets')
const docsScriptsDir = path.resolve(process.cwd(), 'docs/scripts')

const traverseDirectory = async (dir: string) => {
    const items = await readdir(dir)
    const files: string[] = []

    for (const item of items) {
        const ext = path.extname(item)

        if (/^[._]/.test(item)) continue

        if (ext) {
            files.push(path.join(dir, item))
        } else if (!/(stylesheets|assets|scripts)/.test(item)) {
            files.push(...(await traverseDirectory(path.join(dir, item))))
        }
    }

    return files
}

marked.use({
    hooks: {
        preprocess(markdown: string) {
            const { attributes, body } = fm(markdown) as {
                attributes: Partial<CustomOptions>
                body: string
            }

            this.options = { ...this.options, ...attributes }
            return body
        },
        postprocess(html: string) {
            const { layout = 'default', ...options } = this
                .options as CustomOptions

            html = DOMPurify.sanitize(html)

            const tableOfContent = [
                ...html.matchAll(
                    /<h[0-6]\sid="[^"]+".*?>.*?<a\s+href="([^"]+)".*?>([^<]+)<\/a>/gm
                ),
            ].map((m) => ({ path: m[1], label: m[2] }))

            return (
                layouts.get(layout)?.({
                    ...options,
                    content: html,
                    siteMap,
                    tableOfContent,
                }) || html
            )
        },
    },
})
;(async () => {
    // create website dir
    await mkdir(docsSiteDir, { recursive: true })

    try {
        await cp(docsAssetsDir, docsAssetsDir.replace(docsDir, docsSiteDir), {
            recursive: true,
        })
    } catch (e) {
        // ignore
    }

    try {
        await cp(
            docsStylesheetsDir,
            docsStylesheetsDir.replace(docsDir, docsSiteDir),
            { recursive: true }
        )
    } catch (e) {
        // ignore
    }

    try {
        await cp(docsScriptsDir, docsScriptsDir.replace(docsDir, docsSiteDir), {
            recursive: true,
        })
    } catch (e) {
        // ignore
    }

    try {
        // import the layouts first
        const layoutPaths = await traverseDirectory(docsLayoutsDir)

        for (const layoutPath of layoutPaths) {
            if (/\.(j|t)s$/.test(layoutPath)) {
                const fileName = path
                    .basename(layoutPath)
                    .replace(path.extname(layoutPath), '')
                const handler = await import(layoutPath)

                layouts.set(fileName, handler.default)
            }
        }
    } catch (e) {
        // ignore
    }

    const filePaths = await traverseDirectory(docsDir)

    filePaths
        .map((p) =>
            p
                .replace(docsDir, '')
                .replace(/\.md/, '.html')
                .replace(/index\.html/, '')
        )
        .forEach((p) => {
            const fileName = path.basename(p) || '/'
            const dir = p.replace(fileName, '').replace(/\/$/, '')

            let currentDir = siteMap

            dir.split('/')
                .filter(Boolean)
                .forEach((d) => {
                    if (!currentDir[d]) {
                        currentDir[d] = {}
                    }

                    currentDir = currentDir[d]
                })

            if (!currentDir[fileName]) {
                currentDir[fileName] = p
            }
        })

    for (const filePath of filePaths) {
        if (filePath.endsWith('.md')) {
            const content = await readFile(filePath, 'utf-8')
            const contentMd = await marked.parse(content)

            const fileWebsitePath = filePath
                .replace(docsDir, docsSiteDir)
                .replace('.md', '.html')
            const fileDirWebsitePath = fileWebsitePath.replace(
                path.basename(fileWebsitePath),
                ''
            )

            await mkdir(fileDirWebsitePath, { recursive: true })
            await writeFile(fileWebsitePath, contentMd, { recursive: true })
        }
    }
})()
