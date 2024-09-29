export interface SiteMap {
    [key: string]: string | SiteMap
}

export interface PageProps {
    name: string
    path: string
    title: string
    description: string
    content: string
    siteMap: SiteMap
    tableOfContent: { path: string; label: string }[]
}

export interface CustomOptions extends Omit<PageProps, 'content'> {
    layout: string
}
