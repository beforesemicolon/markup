import { html, repeat } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { IntroGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import essentialTraining from '../data/essential-training.json'
import { PlaylistContent } from '../partials/playlist-content'

const page = IntroGroup.list[2]

export default DocPageLayout(
    page.path,
    html` ${Heading(page.name)} ${PlaylistContent(essentialTraining)} `
)
