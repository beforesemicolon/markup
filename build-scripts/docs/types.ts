export interface PageProps {
    name: string
    path: string
    title: string
    description: string
    content: string
}

export interface CustomOptions extends Omit<PageProps, 'content'> {
    layout: string
}
