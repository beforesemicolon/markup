import { html, HtmlTemplate, when } from '../../src'
import { Header } from './header'
import { Footer } from './footer'
import { Page } from '../type'

const devMode = process.env.NODE_ENV === 'development'

interface PageProps {
    siteName: string
    page: Page
    content: HtmlTemplate
    stylesheets?: HtmlTemplate
    scripts?: HtmlTemplate
    basePath?: string
}

export const PageLayout = ({
    siteName,
    page,
    content,
    stylesheets,
    basePath = './',
}: PageProps) => html`
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            <title>${page.title}</title>
            <meta name="description" content="${page.description}" />
            <meta property="og:title" content="${page.title}" />
            <meta property="og:type" content="website" />
            <meta property="og:description" content="${page.description}" />
            <meta
                property="og:image"
                content="https://markup.beforesemicolon.com/assets/markup-banner.jpg"
            />
            <meta
                property="og:url"
                content="https://markup.beforesemicolon.com${page.path}"
            />
            <meta property="og:site_name" content="${siteName}" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@MarkupJs" />
            <meta name="twitter:title" content="${page.title}" />
            <meta
                name="twitter:image"
                content="https://markup.beforesemicolon.com/assets/markup-banner.jpg"
            />
            <meta name="twitter:description" content="${page.description}" />
            <meta name="twitter:image:alt" content="${page.title}" />
            <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="${basePath}assets/favicon/apple-touch-icon.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="${basePath}assets/favicon/favicon-32x32.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="${basePath}assets/favicon/favicon-16x16.png"
            />
            <link
                rel="manifest"
                href="${basePath}assets/favicon/site.webmanifest"
            />
            <link
                rel="icon"
                type="image/x-icon"
                href="${basePath}assets/favicon/favicon.ico"
            />
            ${stylesheets}
        </head>
        <body>
            ${when(
                !devMode,
                html`
                    <!-- Google tag (gtag.js) -->
                    <script
                        async
                        src="https://www.googletagmanager.com/gtag/js?id=G-N3MXGDP5PS"
                    ></script>
                    <script>
                        window.dataLayer = window.dataLayer || []
                        function gtag() {
                            dataLayer.push(arguments)
                        }
                        gtag('js', new Date())

                        gtag('config', 'G-N3MXGDP5PS')
                    </script>
                `
            )}
            ${Header({ basePath })}
            <main class="wrapper">${content}</main>
            ${Footer({ basePath })}
        </body>

        <script type="application/javascript">
            // handle all possible copy snippet code button on the page
            // this implementation is in sync with CodeSnippet partial
            document.querySelectorAll('.code-copy-btn').forEach((copyBtn) => {
                let timer
                if (copyBtn) {
                    // the code is inside the "pre" tag right before the button
                    const code = copyBtn.previousElementSibling.textContent

                    // no code, no copy button
                    if (code.trim().length) {
                        copyBtn.style.visibility = 'visible'
                        copyBtn.addEventListener('click', () => {
                            clearTimeout(timer)
                            navigator.clipboard.writeText(code.trim())
                            copyBtn.textContent = 'copied'
                            copyBtn.classList.add('copied')
                            timer = setTimeout(() => {
                                copyBtn.textContent = 'copy'
                                copyBtn.classList.remove('copied')
                            }, 1000)
                        })
                    }
                }
            })
        </script>
    </html>
`
