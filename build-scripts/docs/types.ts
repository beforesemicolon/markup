export interface PageProps {
    name: string
    path: string
    order: number
    title: string
    description: string
    content: string
    siteMap: SiteMap
    tableOfContent: { path: string; label: string }[]
}

export interface CustomOptions extends Omit<PageProps, 'content'> {
    layout: string
}

export type SiteMap = Map<string, CustomOptions | SiteMap>
