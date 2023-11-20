import { html, state } from './html'
import {
    and,
    effect,
    is,
    isNot,
    oneOf,
    or,
    pick,
    repeat,
    when,
} from './helpers'
import { helper, Helper } from './Helper'
import { val, element, suspense } from './utils'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (window) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.BFS = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...(window.BFS || {}),
        MARKUP: {
            html,
            state,
            // helpers
            and,
            effect,
            Helper,
            helper,
            is,
            isNot,
            oneOf,
            or,
            pick,
            repeat,
            when,
            // utils
            element,
            suspense,
            val,
        },
    }
}
