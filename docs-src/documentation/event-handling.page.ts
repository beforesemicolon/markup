import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { TemplatingGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'

const page = TemplatingGroup.list[5]

export default DocPageLayout(page.path, html`${Heading(page.name)}`)
