import { html } from '../src'
import { PageLayout } from './partials/page-layout'
import { PageComponentProps } from './type'

export default ({ page }: PageComponentProps) =>
    PageLayout({
        title: page.title,
        description: page.description,
        stylesheets: html`
            <link
                rel="stylesheet"
                href="./stylesheets/hybrid.hightlighter.css"
            />
            <link rel="stylesheet" href="./stylesheets/landing.css" />
        `,
        content: html`
            <div class="wrapper" style="height: 500px; padding-top: 50px;">
                <h2>404 - Page Not Found</h2>
                <p>
                    Either the page was moved or removed, or you are making
                    stuff up :/.
                </p>
                <img
                    loading="lazy"
                    src="./assets/markup-banner.jpg"
                    alt="Markup by Before Semicolon"
                />
            </div>
        `,
    })
