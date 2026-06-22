import { buildDocs } from '@beforesemicolon/builder'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { renderCodeBlock } from './docs/_layouts/_code-snippet.js'

const source = new URL('./docs/llms.txt', import.meta.url)
const docsRoot = new URL('./docs/', import.meta.url)
const website = new URL('./website/', import.meta.url)
const siteUrl = 'https://markup.beforesemicolon.com'

const snippetHeader = (label, button, filename = 'snippet') =>
    `<div class=header><div class=mac-dots><span class=dot-red></span><span class=dot-yellow></span><span class=dot-green></span></div><div class=filename>${filename}</div>${label}${button}</div>`

const escapeXML = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

const parseFrontMatter = (markdown) => {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/)
    const data = {}

    if (!match) {
        return { data, body: markdown }
    }

    match[1].split('\n').forEach((line) => {
        const index = line.indexOf(':')

        if (index === -1) return

        data[line.slice(0, index).trim()] = line.slice(index + 1).trim()
    })

    return {
        data,
        body: markdown.slice(match[0].length),
    }
}

const stripMarkdown = (markdown) =>
    markdown
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^---+$/gm, ' ')
        .replace(/[>*_~]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

const markdownPathToOutputPath = (fileUrl) => {
    const relative = fileUrl.pathname.slice(docsRoot.pathname.length)

    if (relative === 'index.md') return '/'

    return `/${relative}`
        .replace(/\.md$/, '')
        .replace(/\/index$/, '/')
        .replace(/\/+/g, '/')
}

const canonicalUrl = (path) => `${siteUrl}${path === '/' ? '/' : path}`

const walkMarkdown = async (dir = docsRoot) => {
    const entries = await readdir(dir, { withFileTypes: true })
    const files = []

    for (const entry of entries) {
        const file = new URL(entry.name, dir)

        if (entry.isDirectory()) {
            files.push(...(await walkMarkdown(new URL(`${entry.name}/`, dir))))
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(file)
        }
    }

    return files
}

const readPages = async () => {
    const files = await walkMarkdown()
    const pages = await Promise.all(
        files.map(async (file) => {
            const markdown = await readFile(file, 'utf8')
            const { data, body } = parseFrontMatter(markdown)

            return {
                sourcePath: file.pathname.slice(docsRoot.pathname.length),
                urlPath: data.path || markdownPathToOutputPath(file),
                title: data.title || data.name || 'Markup Documentation',
                name: data.name || data.title || 'Markup Documentation',
                description:
                    data.description ||
                    stripMarkdown(body).slice(0, 156) ||
                    'Markup documentation page.',
                order: Number(data.order || 999),
                body,
                summary: stripMarkdown(body).slice(0, 320),
            }
        })
    )

    return pages.sort(
        (a, b) => a.order - b.order || a.urlPath.localeCompare(b.urlPath)
    )
}

const generateSitemap = (pages) => {
    const today = new Date().toISOString().slice(0, 10)
    const urls = pages
        .map((page) => {
            const priority = page.urlPath === '/' ? '1.0' : '0.8'

            return `    <url>
        <loc>${escapeXML(canonicalUrl(page.urlPath))}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${priority}</priority>
    </url>`
        })
        .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

const generateRobots = () => `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Host: ${siteUrl}
`

const generateLlms = async (pages) => {
    const intro = (await readFile(source, 'utf8')).trim()
    const pageIndex = pages
        .map((page) => `- ${page.name}: ${page.urlPath} - ${page.description}`)
        .join('\n')

    return `${intro}

## Complete page index

${pageIndex}
`
}

const generateLlmsFull = (pages) => {
    const entries = pages
        .map(
            (page) => `## ${page.title}

URL: ${canonicalUrl(page.urlPath)}
Source: docs/${page.sourcePath}
Description: ${page.description}

${page.summary || page.description}
`
        )
        .join('\n')

    return `# Markup documentation for AI agents

This file is generated at build time from the Markdown documentation. Use it to choose the most relevant page before reading the canonical HTML documentation.

${entries}
`
}

const generateSeoFiles = async () => {
    const pages = await readPages()

    await Promise.all([
        writeFile(new URL('./sitemap.xml', website), generateSitemap(pages)),
        writeFile(new URL('./robots.txt', website), generateRobots()),
        writeFile(new URL('./llms.txt', website), await generateLlms(pages)),
        writeFile(new URL('./llms-full.txt', website), generateLlmsFull(pages)),
    ])
}

const normalizeCodeBlocks = async (dir) => {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
        if (entry.isDirectory()) {
            await normalizeCodeBlocks(new URL(`${entry.name}/`, dir))
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            const file = new URL(entry.name, dir)
            const html = await readFile(file, 'utf8')

            let normalized = html.replace(
                /<div class="code-snippet">[\s\S]*?<div class="content">[\s\S]*?<pre><code[\s\S]*?>([\s\S]*?)<\/code><\/pre><\/div>[\s\S]*?<button[\s\S]*?<\/button><\/div>/g,
                (match, codeContent) => {
                    const labelMatch = match.match(
                        /<div class="label[^>]*>(.*?)<\/div>/
                    )
                    const label = labelMatch
                        ? labelMatch[1].trim()
                        : 'javascript'

                    const code = codeContent
                        .replace(/<span[^>]*>/g, '')
                        .replace(/<\/span>/g, '')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'")
                        .trim()

                    return renderCodeBlock('snippet', code, label)
                }
            )

            if (normalized !== html) {
                await writeFile(file, normalized)
            }
        }
    }
}

buildDocs()
    .then(async () => {
        await mkdir(website, { recursive: true })
        await normalizeCodeBlocks(website)
        await generateSeoFiles()
    })
    .catch(console.error)
