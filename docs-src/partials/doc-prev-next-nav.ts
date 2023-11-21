import { html, when } from '../../src'
import { Page } from '../type'

interface DocPrevNextNavProps {
    prev?: Page
    next?: Page
}

export const DocPrevNextNav = ({ prev, next }: DocPrevNextNavProps) => {
    return html`<div class="doc-prev-next-nav">
        ${when(
            prev,
            () =>
                html`<a href="..${prev?.path}" class="prev-page"
                    ><< ${prev?.name}</a
                >`,
            html`<span />`
        )}
        ${when(
            next,
            () =>
                html`<a href="..${next?.path}" class="next-page"
                    >${next?.name} >></a
                > `,
            html`<span />`
        )}
    </div>`
}
