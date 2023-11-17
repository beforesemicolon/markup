import { html, HtmlTemplate } from '../../src'
import { Header } from './header'
import { Footer } from './footer'

interface PageProps {
    content: HtmlTemplate
    title?: string
    stylesheets?: HtmlTemplate
    scripts?: HtmlTemplate
    basePath?: string
    path?: string
}

export const PageLayout = ({
    title = 'Markup - HTML Templating System by Before Semicolon',
    content,
    stylesheets,
    basePath = './',
    path = '',
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
            <meta name="description" content="${title}" />
            <meta property="og:title" content="${title}" />
            <meta property="og:type" content="website" />
            <meta property="og:description" content="${title}" />
            <meta
                property="og:image"
                content="https://markup.beforesemicolon.com/assets/before-semicolon-logo.png"
            />
            <meta
                property="og:url"
                content="https://markup.beforesemicolon.com/${path}"
            />
            <meta property="og:site_name" content="Markup" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@beforesemicolon" />
            <meta name="twitter:title" content="${title}" />
            <meta
                name="twitter:image"
                content="https://markup.beforesemicolon.com/assets/before-semicolon-logo.png"
            />
            <meta name="twitter:description" content="${title}" />
            <meta name="twitter:image:alt" content="${title}" />
            ${stylesheets}
        </head>
        <body>
            ${Header({ basePath })}
            <main>${content}</main>
            ${Footer({ basePath })}
        </body>
    </html>
`
