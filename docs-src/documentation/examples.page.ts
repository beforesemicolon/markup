import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { IntroGroup } from '../data/documents'

const page = IntroGroup.list[4]

export default DocPageLayout(page.path, html` <h2>${page.name}</h2> `)
