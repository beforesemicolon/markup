import { html, state } from './html'
import {
    and,
    element,
    effect,
    is,
    isNot,
    oneOf,
    or,
    pick,
    repeat,
    suspense,
    when,
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
        state,
        and,
        element,
        effect,
        is,
        isNot,
        oneOf,
        or,
        pick,
        repeat,
        suspense,
        when,
        helper,
        Helper,
    }
}
