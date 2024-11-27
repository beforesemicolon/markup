import meta from './_head-meta.js'
import header from './_header.js'
import footer from './_footer.js'
import copyCode from './_copy-code.js'

const githubDocsPath =
    'https://github.com/beforesemicolon/markup/tree/main/docs'

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
    const pages = [...docs.values()].flatMap((page) =>
        page instanceof Map ? [...page.values()] : [page]
    )

    let nextPage, previousPage

    for (let i = 0; i < pages.length; i++) {
        if (pages[i].path === props.path) {
            nextPage = pages[i + 1]
            previousPage = pages[i - 1]
        }
    }

    return `
<!doctype html>
<html lang="en">
    <head>
        ${meta(props)}
        <link rel="stylesheet" href="/stylesheets/documentation.css">
    </head>
    <body>
        ${header(props)}
        
        <div id="mobile-menu-toggle">
            <a href="#docs-nav" aria-label="toggle mobile menu open"></a>
        </div>
        
        <main id="documentation" class="wrapper">
            <nav id="docs-nav">
                ${docsMenu}
                <a href="${props.path}" class="close-mobile-menu" aria-label="toggle mobile menu close"></a>
            </nav>
            <article>
                ${props.content}
                
                <div id="page-navigation">
                    ${previousPage ? `<a href="${previousPage.path}" id="prev-doc">&lt;&lt; ${previousPage.name}</a>` : ''}
                    ${nextPage ? `<a href="${nextPage.path}" id="next-doc">${nextPage.name} &gt;&gt;</a>` : ''}
                </div>
                
                <a href="${`${githubDocsPath}${props.path.replace('.html', '')}.md`}" id="edit-doc">edit this doc</a>
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
