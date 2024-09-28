import { PageProps } from '../../build-scripts/docs/types'

export default ({ title, description, content }: PageProps) => `
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        />
        <meta name="description" content="${description}" />
        <title>${title}</title>
    </head>
    <body>
        ${content}
    </body>
</html>
`
