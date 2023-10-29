import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { TemplatingGroup } from '../data/documents'

const page = TemplatingGroup.list[5]

export default DocPageLayout(page.path, html` <h2>${page.name}</h2> `)
