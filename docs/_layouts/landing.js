import meta from './_head-meta.js'
import header from './_header.js'
import footer from './_footer.js'
import copyCode from './_copy-code.js'

export default (props) => {
    return `
<!doctype html>
<html lang="en">
    <head>
        ${meta(props)}
        <link rel="stylesheet" href="/stylesheets/landing.css">
    </head>
    <body>
        ${header(props)}
        
        <main class="wrapper">
            ${props.content}
        </main>
        
        ${footer()}
        
        ${copyCode()}
        
    </body>
</html>
`
}
