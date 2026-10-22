import { html, HtmlTemplate } from '../html.ts'
import { visible, VisibleOptions } from './visible.helper.ts'
import { repeat } from './repeat.helper.ts'
import { state } from '../state.ts'

describe('visible observer ownership and progressive enhancement', () => {
    let originalObserver: PropertyDescriptor | undefined
    let observers: MockObserver[]
    let templates: HtmlTemplate[]
    let rootMargin: string
    let scenario = 0

    class MockObserver implements IntersectionObserver {
        readonly root: Element | Document | null
        readonly rootMargin: string
        readonly thresholds: number[]
        observe = jest.fn<void, [Element]>()
        unobserve = jest.fn<void, [Element]>()
        disconnect = jest.fn<void, []>()
        records: IntersectionObserverEntry[] = []
        takeRecords = jest.fn(() => this.records.splice(0))

        constructor(
            private callback: IntersectionObserverCallback,
            init: IntersectionObserverInit = {}
        ) {
            this.root = init.root ?? null
            this.rootMargin = init.rootMargin ?? '0px'
            this.thresholds = Array.isArray(init.threshold)
                ? init.threshold
                : [init.threshold ?? 0]
            observers.push(this)
        }

        entry(target: Element, isIntersecting = true): IntersectionObserverEntry {
            const rect = target.getBoundingClientRect()
            return {
                target,
                isIntersecting,
                boundingClientRect: rect,
                intersectionRect: rect,
                intersectionRatio: isIntersecting ? 1 : 0,
                rootBounds: null,
                time: performance.now(),
            }
        }

        emit(target: Element, isIntersecting = true) {
            this.callback([this.entry(target, isIntersecting)], this)
        }
    }

    beforeEach(() => {
        originalObserver = Object.getOwnPropertyDescriptor(
            globalThis,
            'IntersectionObserver'
        )
        observers = []
        templates = []
        rootMargin = `${++scenario}px`
        document.body.innerHTML = ''
        Object.defineProperty(globalThis, 'IntersectionObserver', {
            configurable: true,
            writable: true,
            value: MockObserver,
        })
    })

    afterEach(() => {
        templates.forEach((template) => template.unmount())
        if (originalObserver) {
            Object.defineProperty(
                globalThis,
                'IntersectionObserver',
                originalObserver
            )
        } else {
            Reflect.deleteProperty(globalThis, 'IntersectionObserver')
        }
        document.body.innerHTML = ''
    })

    const create = (
        label: string,
        options: VisibleOptions = {},
        placeholder: unknown = html`<p>Loading</p>`
    ) => {
        const content = jest.fn(() => html`<button>${label}</button>`)
        const template = visible(content, placeholder, {
            rootMargin,
            ...options,
        })
        templates.push(template)
        return { template, content }
    }

    it.each([false, true])('replaces instance-bound state within retained keyed rows (already revealed: %s)', async (alreadyRevealed) => {
        const [items, setItems] = state([{ id: 1, label: 'old' }])
        const view = html`<section>${repeat(items, (item) =>
            html`<article><input />${visible(
                () => html`<button>${item.label}</button>`,
                html`<p>Loading</p>`,
                { rootMargin }
            )}</article>`, { key: (item) => item.id })}</section>`
        templates.push(view)
        view.render(document.body)
        const row = document.querySelector('article')!
        const input = document.querySelector('input')!
        input.value = 'unsaved'
        const firstObserver = observers[0]
        const firstTarget = firstObserver.observe.mock.calls[0][0]
        if (alreadyRevealed) {
            firstObserver.emit(firstTarget)
            await Promise.resolve()
            expect(row.querySelector('button')?.textContent).toBe('old')
        }

        setItems([{ id: 1, label: 'new' }])
        await Promise.resolve()
        expect(document.querySelector('article')).toBe(row)
        expect(document.querySelector('input')).toBe(input)
        expect(input.value).toBe('unsaved')
        expect(row.textContent).toContain('Loading')
        expect(firstObserver.unobserve).toHaveBeenCalledWith(firstTarget)
        const currentObserver = observers[observers.length - 1]
        const currentTarget = currentObserver.observe.mock.calls.at(-1)![0]
        expect(currentTarget).not.toBe(firstTarget)
        expect(currentTarget.isConnected).toBe(true)
        currentObserver.emit(currentTarget)
        await Promise.resolve()
        expect(row.querySelector('button')?.textContent).toBe('new')
        firstObserver.emit(firstTarget)
        await Promise.resolve()
        expect(row.querySelector('button')?.textContent).toBe('new')
        expect(currentObserver.disconnect).toHaveBeenCalledTimes(1)
    })

    it('uses each root identity for otherwise identical observation options', async () => {
        const firstRoot = document.createElement('section')
        const secondRoot = document.createElement('section')
        document.body.append(firstRoot, secondRoot)
        const first = create('First', { root: firstRoot })
        const second = create('Second', { root: secondRoot })
        first.template.render(firstRoot)
        second.template.render(secondRoot)

        expect(observers).toHaveLength(2)
        expect(observers.map((observer) => observer.root)).toEqual([
            firstRoot,
            secondRoot,
        ])
        observers[1].emit(observers[1].observe.mock.calls[0][0])
        await Promise.resolve()

        expect(first.content).not.toHaveBeenCalled()
        expect(second.content).toHaveBeenCalledTimes(1)
        expect(firstRoot.textContent).toContain('Loading')
        expect(secondRoot.textContent).toContain('Second')
    })

    it('keeps a shared observer until its last target is released', async () => {
        const root = document.createElement('section')
        document.body.append(root)
        const first = create('First', { root })
        const second = create('Second', { root })
        first.template.render(root)
        second.template.render(root)

        expect(observers).toHaveLength(1)
        const observer = observers[0]
        expect(observer.observe).toHaveBeenCalledTimes(2)
        const firstTarget = observer.observe.mock.calls[0][0]
        const secondTarget = observer.observe.mock.calls[1][0]

        first.template.unmount()
        expect(observer.unobserve).toHaveBeenCalledWith(firstTarget)
        expect(observer.disconnect).not.toHaveBeenCalled()
        observer.emit(secondTarget)
        await Promise.resolve()

        expect(second.content).toHaveBeenCalledTimes(1)
        expect(observer.unobserve).toHaveBeenCalledTimes(2)
        expect(observer.disconnect).toHaveBeenCalledTimes(1)
        second.template.unmount()
        expect(observer.unobserve).toHaveBeenCalledTimes(2)
        expect(observer.disconnect).toHaveBeenCalledTimes(1)

        create('Third', { root }).template.render(root)
        expect(observers).toHaveLength(2)
    })

    it('shares the viewport observer for equivalent threshold configurations', () => {
        create('First', { threshold: [0.5, 0] }).template.render(document.body)
        create('Second', { root: null, threshold: [0, 0.5] }).template.render(
            document.body
        )

        expect(observers).toHaveLength(1)
        expect(observers[0].observe).toHaveBeenCalledTimes(2)
    })

    it('separates observers when margins or thresholds differ', () => {
        const root = document.createElement('section')
        document.body.append(root)
        create('First', { root, threshold: 0 }).template.render(root)
        create('Second', { root, threshold: 0.5 }).template.render(root)
        create('Third', { root, rootMargin: '99px' }).template.render(root)

        expect(observers).toHaveLength(3)
        expect(observers.map((observer) => observer.thresholds)).toEqual([
            [0],
            [0.5],
            [0],
        ])
        expect(observers[2].rootMargin).toBe('99px')
    })

    it.each(['viewport', 'element', 'document'] as const)(
        'evicts an idle %s observer after unmount',
        (kind) => {
            const root =
                kind === 'viewport'
                    ? null
                    : kind === 'document'
                      ? document
                      : document.createElement('section')
            const first = create('First', { root })
            first.template.render(document.body)
            const observer = observers[0]
            first.template.unmount()
            first.template.unmount()

            expect(observer.unobserve).toHaveBeenCalledTimes(1)
            expect(observer.disconnect).toHaveBeenCalledTimes(1)
            create('Second', { root }).template.render(document.body)
            expect(observers).toHaveLength(2)
        }
    )

    it('ignores queued deliveries from a disposed observer after remount', async () => {
        const placeholder = document.createElement('p')
        placeholder.textContent = 'Loading'
        const { template, content } = create('Content', {}, placeholder)
        template.render(document.body)
        const oldObserver = observers[0]
        expect(oldObserver.observe).toHaveBeenCalledWith(placeholder)
        template.unmount()
        template.render(document.body)

        expect(observers).toHaveLength(2)
        const newObserver = observers[1]
        expect(newObserver.observe).toHaveBeenCalledWith(placeholder)
        oldObserver.emit(placeholder)
        await Promise.resolve()
        expect(content).not.toHaveBeenCalled()
        expect(document.body.textContent).toContain('Loading')

        newObserver.emit(placeholder, false)
        await Promise.resolve()
        expect(content).not.toHaveBeenCalled()
        newObserver.emit(placeholder)
        newObserver.emit(placeholder)
        await Promise.resolve()
        expect(content).toHaveBeenCalledTimes(1)
        expect(document.body.textContent).toContain('Content')
        expect(newObserver.disconnect).toHaveBeenCalledTimes(1)
    })

    it('retains every registration when two placeholders use the same target', async () => {
        const placeholder = document.createElement('p')
        const first = create('First', {}, placeholder)
        const second = create('Second', {}, placeholder)
        first.template.render(document.body)
        second.template.render(document.body)

        expect(observers).toHaveLength(1)
        expect(observers[0].observe).toHaveBeenCalledTimes(1)
        observers[0].emit(placeholder)
        await Promise.resolve()

        expect(first.content).toHaveBeenCalledTimes(1)
        expect(second.content).toHaveBeenCalledTimes(1)
        expect(document.body.textContent).toContain('First')
        expect(document.body.textContent).toContain('Second')
        expect(observers[0].unobserve).toHaveBeenCalledTimes(1)
        expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
    })

    it('discards stale records on re-observation while delivering other queued targets', async () => {
        const first = create('First')
        const placeholder = document.createElement('p')
        placeholder.textContent = 'Loading'
        const second = create('Second', {}, placeholder)
        first.template.render(document.body)
        second.template.render(document.body)
        const observer = observers[0]
        const firstTarget = observer.observe.mock.calls[0][0]
        observer.records.push(
            observer.entry(firstTarget),
            observer.entry(placeholder)
        )
        second.template.unmount()
        second.template.render(document.body)
        await Promise.resolve()

        expect(observers).toHaveLength(1)
        expect(observer.records).toHaveLength(0)
        expect(first.content).toHaveBeenCalledTimes(1)
        expect(second.content).not.toHaveBeenCalled()
        expect(document.body.textContent).toContain('Loading')
        expect(observer.disconnect).not.toHaveBeenCalled()

        observer.emit(placeholder)
        await Promise.resolve()
        expect(second.content).toHaveBeenCalledTimes(1)
        expect(observer.disconnect).toHaveBeenCalledTimes(1)
    })

    it('renders eagerly without allocating an observer', () => {
        const { template, content } = create('Content', { eager: true })
        template.render(document.body)

        expect(content).toHaveBeenCalledTimes(1)
        expect(document.body.textContent).toContain('Content')
        expect(observers).toHaveLength(0)
    })

    it.each([undefined, false])(
        'reveals immediately without IntersectionObserver when eager is %s',
        (eager) => {
            Reflect.deleteProperty(globalThis, 'IntersectionObserver')
            const { template, content } = create('Content', { eager })
            template.render(document.body)

            expect(content).toHaveBeenCalledTimes(1)
            expect(document.body.textContent).toContain('Content')
            expect(document.body.textContent).not.toContain('Loading')
        }
    )

    it('serializes content when IntersectionObserver is unavailable', () => {
        Reflect.deleteProperty(globalThis, 'IntersectionObserver')
        const { template } = create('Server content')

        expect(template.toString()).toContain('<button>Server content</button>')
        expect(template.toString()).not.toContain('Loading')
        expect(observers).toHaveLength(0)
    })

    it('reveals if IntersectionObserver disappears before mounting', async () => {
        const { template, content } = create('Content')
        Reflect.deleteProperty(globalThis, 'IntersectionObserver')
        template.render(document.body)
        await Promise.resolve()

        expect(content).toHaveBeenCalledTimes(1)
        expect(document.body.textContent).toContain('Content')
        expect(observers).toHaveLength(0)
    })
})
