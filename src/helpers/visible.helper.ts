import { html, HtmlTemplate } from '../html.ts'
import { state } from '../state.ts'
import { when } from './when.helper.ts'

export interface VisibleOptions extends IntersectionObserverInit {
    eager?: boolean
}

interface ObserverPool {
    observer: IntersectionObserver
    targets: Map<Element, Set<() => void>>
    releaseTarget: (target: Element) => void
    deliver: (entries: IntersectionObserverEntry[]) => void
}

const rootObservers = new WeakMap<
    Element | Document,
    Map<string, ObserverPool>
>()
const viewportObservers = new Map<string, ObserverPool>()

const getObserver = (init: IntersectionObserverInit): ObserverPool => {
    const root = init.root ?? null
    let observers = root ? rootObservers.get(root) : viewportObservers
    if (!observers) {
        observers = new Map()
        rootObservers.set(root!, observers)
    }
    const threshold = init.threshold ?? 0
    const thresholds = Array.isArray(threshold)
        ? threshold.length
            ? [...threshold].sort((a, b) => a - b)
            : [0]
        : [threshold]
    const key = JSON.stringify([init.rootMargin, thresholds])
    let pool = observers.get(key)
    if (!pool) {
        const targets = new Map<Element, Set<() => void>>()
        const releaseTarget = (target: Element) => {
            if (!targets.delete(target)) return
            observer.unobserve(target)
            if (!targets.size) {
                observer.disconnect()
                observers.delete(key)
                if (root && !observers.size) rootObservers.delete(root)
            }
        }
        const deliver = (entries: IntersectionObserverEntry[]) => {
            for (const entry of entries) {
                const callbacks = targets.get(entry.target)
                if (!entry.isIntersecting || !callbacks) continue
                const subscribers = [...callbacks]
                callbacks.clear()
                releaseTarget(entry.target)
                subscribers.forEach((reveal) => reveal())
            }
        }
        const observer = new IntersectionObserver(deliver, {
            ...init,
            threshold: thresholds,
        })
        pool = { observer, targets, releaseTarget, deliver }
        observers.set(key, pool)
    }
    return pool
}

const observe = (
    target: Element,
    reveal: () => void,
    options: IntersectionObserverInit
): (() => void) => {
    const pool = getObserver(options)
    let active = true
    const notify = () => {
        if (!active) return
        active = false
        reveal()
    }
    const existing = pool.targets.get(target)
    // unobserve() does not discard queued entries. On re-observation, ignore
    // the target's previous entries without losing another target's delivery.
    const pending = existing
        ? []
        : pool.observer.takeRecords().filter((entry) => entry.target !== target)
    const callbacks = existing ?? new Set<() => void>()
    callbacks.add(notify)
    pool.targets.set(target, callbacks)
    pool.deliver(pending)

    const stop = () => {
        if (!active) return
        active = false
        callbacks.delete(notify)
        if (!callbacks.size) pool.releaseTarget(target)
    }
    if (!existing) {
        try {
            pool.observer.observe(target)
        } catch (error) {
            stop()
            throw error
        }
    }
    return stop
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
    const [revealed, setRevealed] = state(
        (options?.eager ?? false) || typeof IntersectionObserver === 'undefined'
    )
    const reveal = () => setRevealed(true)

    // Wrap in display: contents container to not affect layout flow
    const template = html`<div style="display: contents;">
        ${when(revealed, content, () => placeholder)}
    </div>`
    // The observer and child getter must refer to the same revealed state.
    template.__INSTANCE_BOUND__ = true

    return template.onMount(() => {
        if (revealed()) return
        if (typeof IntersectionObserver === 'undefined') {
            reveal()
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
            return observe(target, reveal, observerOpts)
        }
    })
}
