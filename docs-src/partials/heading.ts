import { element } from '../../src'
import { toHashId } from '../utils/to-hash-id'

export const Heading = (
    content: string,
    tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h2'
) => {
    const id = toHashId(content)

    return element(tag, {
        attributes: {
            id,
            class: 'heading',
        },
        htmlContent: `<a href="#${id}">${content}</a>`,
    })
}
