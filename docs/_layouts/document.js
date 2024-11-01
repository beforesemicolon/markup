import meta from './_head-meta.js'
import header from './_header.js'
import footer from './_footer.js'
import copyCode from './_copy-code.js'

const githubDocsPath =
    'https://github.com/beforesemicolon/markup/tree/main/docs/documentation'

const navCategoryToHTML = (docs, currentPath) =>
    Array.from(docs.entries())
        .map(([k, v]) => {
            if (k.endsWith('.html')) {
                const href = v.path.replace(/(index)?\.html/, '')

                return `<li ${
                    currentPath === v.path ? 'class="active"' : ''
                }><a href="${href}">${v.name}</a></li>`
            }

            return `<ol><span>${k}</span>${navCategoryToHTML(
                v,
                currentPath
            )}</ol>`
        })
        .join('')

export default (props) => {
    const docs = props.siteMap.get('documentation')
    const docsMenu = `<ul>${navCategoryToHTML(docs, props.path)}</ul>`

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
            <input type="checkbox" id="mobile-menu-toggle" aria-label="toggle mobile menu">
            <nav id="docs-nav">
                ${docsMenu}
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
