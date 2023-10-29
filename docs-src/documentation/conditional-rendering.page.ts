import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { HelpersGroup } from '../data/documents'

const page = HelpersGroup.list[1]

export default DocPageLayout(page.path, html` <h2>${page.name}</h2> `)
