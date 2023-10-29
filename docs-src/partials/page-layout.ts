import { html, HtmlTemplate } from '../../src'
import { Header } from './header'
import { Footer } from './footer'

interface PageProps {
    title: string
    content: HtmlTemplate
    stylesheets?: HtmlTemplate
    scripts?: HtmlTemplate
    basePath?: string
}

export const PageLayout = ({
    title,
    content,
    stylesheets,
    scripts,
    basePath = './',
}: PageProps) => html`
    <!doctype html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            <title>${title}</title>
            <script src="https://unpkg.com/@beforesemicolon/html/dist/client.js"></script>
            <link
                rel="stylesheet"
                href="${basePath}stylesheets/normalize.css"
            />
            <link rel="stylesheet" href="${basePath}stylesheets/common.css" />
            ${stylesheets} ${scripts}
        </head>
        <body>
            ${Header({ basePath })}
            <main>${content}</main>
            ${Footer({ basePath })}
        </body>
    </html>
`
