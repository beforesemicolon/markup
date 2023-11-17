import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { IntroGroup, TemplatingGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'

const page = IntroGroup.list[4]

export default DocPageLayout(
    page.path,
    html`
        ${Heading(page.name)}
        ${DocPrevNextNav({
            prev: {
                label: IntroGroup.list[3].name,
                link: IntroGroup.list[3].path,
            },
            next: {
                label: TemplatingGroup.list[0].name,
                link: TemplatingGroup.list[0].path,
            },
        })}
    `
)
