import { Marked } from 'marked'
import { mkdir, readdir, readFile, writeFile, cp } from 'fs/promises'
import path from 'path'
import fm from 'front-matter'
import DOMPurify from 'isomorphic-dompurify'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import defaultTemp from './templates/default'
import { CustomOptions, PageProps } from './types'
import renderer from './renderer'

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

;(async () => {
    // create website dir
    await mkdir(docsSiteDir, { recursive: true })

    try {
        await cp(docsAssetsDir, docsAssetsDir.replace(docsDir, docsSiteDir), {
            recursive: true,
        })
    } catch (e) {}

    try {
        await cp(
            docsStylesheetsDir,
            docsStylesheetsDir.replace(docsDir, docsSiteDir),
            { recursive: true }
        )
    } catch (e) {}

    try {
        await cp(docsScriptsDir, docsScriptsDir.replace(docsDir, docsSiteDir), {
            recursive: true,
        })
    } catch (e) {}

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

    for (const filePath of filePaths) {
        if (filePath.endsWith('.md')) {
            const content = await readFile(filePath, 'utf-8')
            let opt: CustomOptions = {
                layout: 'default',
                title: '',
                description: '',
                name: '',
                path: '',
            }
            const contentMd = await marked
                .use({
                    hooks: {
                        preprocess(markdown: string) {
                            const { attributes, body } = fm(markdown) as {
                                attributes: Partial<CustomOptions>
                                body: string
                            }

                            opt = { ...opt, ...attributes }

                            return body
                        },
                        postprocess(html: string) {
                            const { layout = 'default', ...options } = opt

                            html = DOMPurify.sanitize(html)

                            return (
                                layouts.get(layout)?.({
                                    ...options,
                                    content: html,
                                }) || html
                            )
                        },
                    },
                })
                .parse(content)

            await writeFile(
                filePath.replace(docsDir, docsSiteDir).replace('.md', '.html'),
                contentMd
            )
        }
    }
})()
