import { PageProps } from '../../build-scripts/docs/types'
import meta from './_head-meta'

export default (props: PageProps) => `
<!doctype html>
<html lang="en">
    <head>
        ${meta(props)}
        <link rel="stylesheet" href="./stylesheets/common.css">
        <link rel="stylesheet" href="./stylesheets/hybrid.hightlighter.css">
    </head>
    <body>
        ${props.content}
        </div>
    </body>
</html>
`
