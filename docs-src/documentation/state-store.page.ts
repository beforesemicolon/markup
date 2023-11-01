import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { ComponentsGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'

const page = ComponentsGroup.list[3]

export default DocPageLayout(page.path, html`${Heading(page.name)}`)
