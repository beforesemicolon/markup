import * as MARKUP from './index.ts'

type MarkupWindow = Window & {
    BFS?: {
        MARKUP?: typeof MARKUP
    }
}

if (typeof window !== 'undefined') {
    const browserWindow = window as MarkupWindow
    browserWindow.BFS = {
        ...browserWindow.BFS,
        MARKUP,
    }
}
