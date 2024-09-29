import { PageProps } from '../../build-scripts/docs/types'
import meta from './_head-meta'
import header from './_header'
import footer from './_footer'
import copyCode from './_copy-code'

export default (props: PageProps) => {
    return `
<!doctype html>
<html lang="en">
    <head>
        ${meta(props)}
        <link rel="stylesheet" href="/stylesheets/document.css">
    </head>
    <body>
        ${header(props)}
        
        <main>
            <article>
                ${props.content}
            </article>
        </main>
        
        ${footer()}
        
        ${copyCode()}
        
    </body>
</html>
`
}
