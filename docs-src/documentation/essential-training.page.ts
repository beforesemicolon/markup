import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { IntroGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'

const page = IntroGroup.list[2]

export default DocPageLayout(page.path, html`${Heading(page.name)}`)
