import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { TemplatingGroup } from '../data/documents'

const page = TemplatingGroup.list[1]

export default DocPageLayout(
    page.path,
    html`
        <h2>${page.name}</h2>
        <h4>Nesting templates</h4>
        <h4>DOM elements</h4>
        <h4>HTML string</h4>
        <h4>Arrays</h4>
        <h4>Nil values</h4>
    `
)
