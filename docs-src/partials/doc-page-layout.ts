import { html, HtmlTemplate } from '../../src'
import { PageLayout } from '../partials/page-layout'
import { DocumentsGroup, Page } from '../type'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'

export const DocPageLayout = ({
    name,
    page,
    nextPage,
    prevPage,
    docsMenu,
    content,
}: {
    name: string
    page: Page
    docsMenu: DocumentsGroup[]
    content: HtmlTemplate
    prevPage?: Page
    nextPage?: Page
}) =>
    PageLayout({
        siteName: name,
        page,
        stylesheets: html`
            <link
                rel="stylesheet"
                href="../stylesheets/hybrid.hightlighter.css"
            />
            <link rel="stylesheet" href="../stylesheets/documentation.css" />
        `,
        basePath: '../',
        content: html`
            <div class="docs">
                <div class="doc-nav" id="menu">
                    <a class="mobile-menu-open" href="#menu">
                        <span>menu</span>
                    </a>
                    <ul class="doc-nav-list" id="doc-nav-list" tabindex="0">
                        ${docsMenu.map(
                            (g) => html`
                                <li>
                                    <span>${g.name}</span>
                                    <ul>
                                        ${g.list.map(
                                            (l) => html`
                                                <li
                                                    class.active="${l.path ===
                                                    page.path}"
                                                >
                                                    <a href="..${l.path}"
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
                    <a href="..${page.path}" class="mobile-menu-close"></a>
                </div>
                <article>
                    ${content}
                    ${DocPrevNextNav({
                        prev: prevPage,
                        next: nextPage,
                    })}
                </article>
            </div>
        `,
    })
