import { html, HtmlTemplate } from '../../src'
import { PageLayout } from '../partials/page-layout'
import {
    IntroGroup,
    TemplatingGroup,
    HelpersGroup,
    ComponentsGroup,
} from '../data/documents'

export const DocPageLayout = (currentPage: string, content: HtmlTemplate) =>
    PageLayout({
        title: 'Tutorial - HTML Templating System - Before Semicolon',
        stylesheets: html`
            <link rel="stylesheet" href="../stylesheets/documentation.css" />
            <link
                rel="stylesheet"
                href="../stylesheets/hybrid.hightlighter.css"
            />
        `,
        basePath: '../',
        content: html`
            <div class="wrapper docs">
                <ul class="docs-list">
                    ${[
                        IntroGroup,
                        TemplatingGroup,
                        HelpersGroup,
                        ComponentsGroup,
                    ].map(
                        (g) => html`
                            <li>
                                <span>${g.name}</span>
                                <ul>
                                    ${g.list.map(
                                        (l) => html`
                                            <li
                                                attr.class.active="${l.path ===
                                                currentPage}"
                                            >
                                                <a href="../${l.path}"
                                                    >${l.name}</a
                                                >
                                            </li>
                                        `
                                    )}
                                </ul>
                            </li>
                        `
                    )}
                </ul>
                <article>${content}</article>
            </div>
        `,
    })
