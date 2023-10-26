import { html, state } from './html'
import {
    repeat,
    when,
    element,
    effect,
    is,
    isNot,
    or,
    and,
    pick,
    oneOf,
    suspense,
} from './helpers'
import { helper, Helper } from './Helper'

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
        is,
        isNot,
        and,
        or,
        pick,
        effect,
        oneOf,
        suspense,
        element,
        state,
        helper,
        Helper,
    }
}
