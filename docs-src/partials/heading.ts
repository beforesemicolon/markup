import { element } from '../../src'

export const Heading = (
    content: string,
    tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h2'
) => {
    const id = content
        .toLowerCase()
        .replace(/[^0-9a-z-\s]/g, '')
        .replace(/\s+/g, '-')

    return element(tag, {
        attributes: {
            id,
            class: 'heading',
        },
        htmlContent: `<a href="#${id}">${content}</a>`,
    })
}
