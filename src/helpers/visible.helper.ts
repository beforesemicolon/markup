import { html, HtmlTemplate } from '../html.ts'
import { state } from '../state.ts'
import { when } from './when.helper.ts'

export interface VisibleOptions extends IntersectionObserverInit {
    eager?: boolean
}

const observers = new Map<string, IntersectionObserver>()
const targets = new Map<Element, () => void>()

const getObserver = (optionsKey: string, init?: IntersectionObserverInit) => {
    let observer = observers.get(optionsKey)
    if (!observer) {
        observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const cb = targets.get(entry.target)
                    if (cb) {
                        targets.delete(entry.target)
                        observer?.unobserve(entry.target)
                        cb()
                    }
                }
            }
        }, init)
        observers.set(optionsKey, observer)
    }
    return observer
}

/**
 * renders the content template only when it becomes visible in the viewport
 * @param content
 * @param placeholder
 * @param options
 */
export const visible = (
    content: () => unknown,
    placeholder: unknown = html`<div style="min-height: 1px;"></div>`,
    options?: VisibleOptions
): HtmlTemplate => {
    const [revealed, setRevealed] = state(options?.eager ?? false)
    const reveal = () => setRevealed(true)

    // Wrap in display: contents container to not affect layout flow
    const template = html`<div style="display: contents;">
        ${when(revealed, content, () => placeholder)}
    </div>`

    return template.onMount(() => {
        if (revealed() || typeof IntersectionObserver === 'undefined') {
            return
        }

        const wrapper = template.childNodes.find(
            (node) => node instanceof HTMLElement
        ) as HTMLElement | undefined

        if (wrapper) {
            const target = wrapper.firstElementChild || wrapper
            const observerOpts: IntersectionObserverInit = {
                root: options?.root ?? null,
                rootMargin: options?.rootMargin ?? '0px',
                threshold: options?.threshold ?? 0,
            }
            const key = `${observerOpts.rootMargin}_${observerOpts.threshold}_${
                observerOpts.root ? 'has-root' : 'no-root'
            }`
            const observer = getObserver(key, observerOpts)

            targets.set(target, reveal)
            observer.observe(target)

            return () => {
                targets.delete(target)
                observer.unobserve(target)
            }
        }
    })
}
