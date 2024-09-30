import { PageProps, SiteMap } from '../../build-scripts/docs/types'
import meta from './_head-meta'
import header from './_header'
import footer from './_footer'
import copyCode from './_copy-code'
import path from 'path'

const githubDocsPath =
    'https://github.com/beforesemicolon/markup/tree/main/docs/documentation'

const navCategoryToHTML = (docs: SiteMap, currentPath: string) =>
    Object.values(docs)
        .filter((p) => typeof p === 'string')
        .map((p) => {
            const href = p.replace(/\.html/, '')

            return `<li ${
                currentPath === href ? 'class="active"' : ''
            }><a href="${href}">${path
                .basename(p)
                .replace(/\.html/, '')
                .replace(/-/g, ' ')}</a></li>`
        })
        .join('')

export default (props: PageProps) => {
    const docs = props.siteMap['documentation'] as SiteMap
    const docsMenu = `
        ${navCategoryToHTML(docs, props.path)}
        ${Object.entries(docs)
            .filter(([, v]) => typeof v !== 'string')
            .map(
                ([k, v]) =>
                    `<ol><span>${k}</span>${navCategoryToHTML(
                        v as SiteMap,
                        props.path
                    )}</ol>`
            )
            .join('')}
    `

    return `
<!doctype html>
<html lang="en">
    <head>
        ${meta(props)}
        <link rel="stylesheet" href="/stylesheets/documentation.css">
    </head>
    <body>
        ${header(props)}
        
        <main id="documentation" class="wrapper">
            <nav id="docs-nav">
                <ul>
                    ${docsMenu}
                </ul>
            </nav>
            <article>
                ${props.content}
                
                <a href="${
                    props.path === '/documentation'
                        ? `${githubDocsPath}/index.md`
                        : `${githubDocsPath}.md`
                }" id="edit-doc">edit this doc</a>
            </article>
            <aside id="table-of-content">
                <h4>Content</h4>
                <ul>
                    ${props.tableOfContent
                        .map(
                            (c) => `<li><a href="${c.path}">${c.label}</a></li>`
                        )
                        .join('')}
                </ul>
            </aside>
        </main>
        
        ${footer()}
        
        ${copyCode()}
        
    </body>
</html>
`
}
