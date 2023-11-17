import { html, repeat } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { IntroGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import essentialTraining from '../data/essential-training.json'
import { PlaylistContent } from '../partials/playlist-content'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'

const page = IntroGroup.list[2]

export default DocPageLayout(
    page.name,
    page.path,
    html` ${Heading(page.name)} ${PlaylistContent(essentialTraining)}
    ${DocPrevNextNav({
        prev: {
            label: IntroGroup.list[1].name,
            link: IntroGroup.list[1].path,
        },
        next: {
            label: IntroGroup.list[3].name,
            link: IntroGroup.list[3].path,
        },
    })}`
)
