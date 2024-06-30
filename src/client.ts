import { html, HtmlTemplate } from './html'
import { state, effect } from './state'
import { and, is, isNot, oneOf, or, pick, repeat, when } from './helpers'
import { element } from './utils/element'
import { suspense } from './utils/suspense'
import { val } from './utils/val'

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
