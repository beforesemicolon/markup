import { html, when } from '../../src'

interface DocPrevNextNavProps {
    prev?: { label: string; link: string }
    next?: { label: string; link: string }
}

export const DocPrevNextNav = ({ prev, next }: DocPrevNextNavProps) => {
    return html`<div class="doc-prev-next-nav">
        ${when(
            prev,
            () =>
                html`<a
                    href="${prev?.link.replace(/^documentation/, '.')}"
                    class="prev-page"
                    ><< ${prev?.label}</a
                >`,
            html`<span />`
        )}
        ${when(
            next,
            () =>
                html`<a
                    href="${next?.link.replace(/^documentation/, '.')}"
                    class="next-page"
                    >${next?.label} >></a
                > `,
            html`<span />`
        )}
    </div>`
}
