import { html, repeat } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import essentialTraining from '../data/essential-training.json'
import { PlaylistContent } from '../partials/playlist-content'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'
import { PageComponentProps } from '../type'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout(
        page.title,
        page.description,
        page.path,
        docsMenu,
        html` ${Heading(page.name)} ${PlaylistContent(essentialTraining)}
        ${DocPrevNextNav({
            prev: prevPage,
            next: nextPage,
        })}`
    )
