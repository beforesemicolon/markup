import { html, state } from './html'
import { repeat, when, element } from './helpers'
import { helper, Helper } from './helper'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (window) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.BFS = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...(window.BFS || {}),
        html,
        repeat,
        when,
        element,
        state,
        helper,
        Helper,
    }
}
