import { html, HtmlTemplate } from './html.ts'
import { state, effect } from './state.ts'
import {
    and,
    is,
    isNot,
    oneOf,
    or,
    pick,
    repeat,
    when,
    element,
    suspense,
    val,
} from './helpers/index.ts'

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
            effect,
            HtmlTemplate,
            // helpers
            and,
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
