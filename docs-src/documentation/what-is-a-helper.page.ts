import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { HelpersGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'

const page = HelpersGroup.list[0]

export default DocPageLayout(page.path, html`${Heading(page.name)}`)