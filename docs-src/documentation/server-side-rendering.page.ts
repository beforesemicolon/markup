import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { ComponentsGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'

const page = ComponentsGroup.list[2]

export default DocPageLayout(
    page.path,
    html`
        ${Heading(page.name)}
        ${DocPrevNextNav({
            prev: {
                label: ComponentsGroup.list[1].name,
                link: ComponentsGroup.list[1].path,
            },
            next: {
                label: ComponentsGroup.list[3].name,
                link: ComponentsGroup.list[3].path,
            },
        })}
    `
)
