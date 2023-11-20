import { html, HtmlTemplate } from '../../src'
import { PageLayout } from '../partials/page-layout'
import { DocumentsGroup } from '../type'

export const DocPageLayout = (
    title: string,
    currentPage: string,
    docMenu: DocumentsGroup[],
    content: HtmlTemplate
) =>
    PageLayout({
        title,
        stylesheets: html`
            <link
                rel="stylesheet"
                href="../stylesheets/hybrid.hightlighter.css"
            />
            <link rel="stylesheet" href="../stylesheets/documentation.css" />
        `,
        basePath: '../',
        path: currentPage,
        content: html`
            <div class="wrapper docs">
                <div class="doc-nav" id="menu">
                    <a class="mobile-menu-open" href="#menu">
                        <span>menu</span>
                    </a>
                    <ul class="doc-nav-list" id="doc-nav-list" tabindex="0">
                        ${docMenu.map(
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
                    <a href="../${currentPage}" class="mobile-menu-close"></a>
                </div>
                <article>${content}</article>
            </div>
        `,
    })
