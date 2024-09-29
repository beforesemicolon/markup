import { PageProps } from '../../build-scripts/docs/types'
import meta from './_head-meta'
import header from './_header'
import footer from './_footer'
import copyCode from './_copy-code'

const githubDocsPath =
    'https://github.com/beforesemicolon/markup/tree/main/docs/documentation'

export default (props: PageProps) => {
    return `
<!doctype html>
<html lang="en">
    <head>
        ${meta(props)}
        <link rel="stylesheet" href="/stylesheets/documentation.css">
    </head>
    <body>
        ${header(props)}
        
        <main>
            <article>
                ${props.content}
                
                <a href="${
                    props.path === '/documentation'
                        ? `${githubDocsPath}/index.md`
                        : `${githubDocsPath}.md`
                }">edit this doc</a>
            </article>
        </main>
        
        ${footer()}
        
        ${copyCode()}
        
    </body>
</html>
`
}
