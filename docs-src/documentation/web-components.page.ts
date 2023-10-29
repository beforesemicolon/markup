import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { ComponentsGroup } from '../data/documents'

const page = ComponentsGroup.list[1]

export default DocPageLayout(page.path, html` <h2>${page.name}</h2> `)
