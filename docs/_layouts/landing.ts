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
        <link rel="stylesheet" href="/stylesheets/landing.css">
    </head>
    <body>
        ${header()}
        
        <main class="wrapper">
            ${props.content}
        </main>
        
        ${footer()}
        
        ${copyCode()}
        
    </body>
</html>
`
}
