import { HtmlTemplate } from '../src'

export interface PageComponentProps {
    name: string
    page: Page
    docsMenu: DocumentsGroup[]
    nextPage?: Page
    prevPage?: Page
}

export interface Page {
    name: string
    path: string
    component: (props: PageComponentProps) => HtmlTemplate
    title: string
    description: string
    group: string
    root: boolean
}

export interface DocumentsGroup {
    name: string
    list: Page[]
}
