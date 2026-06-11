import { visible } from './visible.helper.ts'
import { html } from '../html.ts'

describe('visible', () => {
    let originalIntersectionObserver: any

    beforeEach(() => {
        document.body.innerHTML = ''
        originalIntersectionObserver = (globalThis as any).IntersectionObserver
    })

    afterEach(() => {
        (globalThis as any).IntersectionObserver = originalIntersectionObserver
    })

    it('should render content immediately if eager: true', () => {
        const template = html`${visible(
            () => html`<p>Content</p>`,
            html`<p>Placeholder</p>`,
            { eager: true }
        )}`

        template.render(document.body)

        expect(document.body.innerHTML).toContain('Content')
        expect(document.body.innerHTML).not.toContain('Placeholder')
    })

    it('should render placeholder first, then content when intersecting', (done) => {
        let observerCallback: any = null
        const observedElements: any[] = []

        class MockObserver {
            constructor(cb: any) {
                observerCallback = cb
            }
            observe(el: any) {
                observedElements.push(el)
            }
            unobserve = jest.fn()
            disconnect = jest.fn()
        }

        ;(globalThis as any).IntersectionObserver = MockObserver

        const template = html`${visible(
            () => html`<p>Content</p>`,
            html`<p>Placeholder</p>`
        )}`

        template.render(document.body)

        expect(document.body.innerHTML).toContain('Placeholder')
        expect(document.body.innerHTML).not.toContain('Content')
        expect(observedElements).toHaveLength(1)

        // Trigger intersection
        observerCallback([{ target: observedElements[0], isIntersecting: true }])

        setTimeout(() => {
            expect(document.body.innerHTML).toContain('Content')
            expect(document.body.innerHTML).not.toContain('Placeholder')
            done()
        }, 0)
    })
})
