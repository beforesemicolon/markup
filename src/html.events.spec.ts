import '../test.common.ts'
import { html, type HtmlTemplate } from './html.ts'

type EventOptions = boolean | AddEventListenerOptions

const buttonTemplate = (
    handler: EventListener,
    options?: EventOptions
): HtmlTemplate => {
    const binding: EventListener | [EventListener, EventOptions] =
        options === undefined ? handler : [handler, options]
    return html`<button onclick="${binding}">button</button>`
}

const parentTemplate = (
    handler: EventListener,
    options: AddEventListenerOptions
): HtmlTemplate => html`<section onclick="${[handler, options]}">
    <button>button</button>
</section>`

describe('event listener updates', () => {
    it('delegates to the latest direct handler without replacing the DOM listener', () => {
        const first: EventListener = jest.fn()
        let receiver: EventTarget | null = null
        const next: EventListener = jest.fn(function (
            this: EventTarget
        ): void {
            receiver = this
        })
        const view = buttonTemplate(first).render(document.body)
        const button = document.querySelector('button')!
        const add = jest.spyOn(button, 'addEventListener')
        const remove = jest.spyOn(button, 'removeEventListener')

        view.__rebind__(buttonTemplate(next))
        button.click()

        expect(add).not.toHaveBeenCalled()
        expect(remove).not.toHaveBeenCalled()
        expect(first).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)
        expect(receiver).toBe(button)
        view.unmount()
    })

    it('rearms once for a new binding without replacing the DOM listener', () => {
        const first: EventListener = jest.fn()
        const next: EventListener = jest.fn()
        const view = buttonTemplate(first, { once: true }).render(document.body)
        const button = document.querySelector('button')!

        button.click()
        button.click()
        expect(first).toHaveBeenCalledTimes(1)

        const add = jest.spyOn(button, 'addEventListener')
        const remove = jest.spyOn(button, 'removeEventListener')
        view.__rebind__(buttonTemplate(next, { once: true }))
        button.click()
        button.click()

        expect(add).not.toHaveBeenCalled()
        expect(remove).not.toHaveBeenCalled()
        expect(first).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledTimes(1)
        view.unmount()
    })

    it('reattaches only when capture, passive, or signal registration changes', () => {
        const order: string[] = []
        const firstController = new window.AbortController()
        const passiveParent: EventListener = jest.fn((event: Event) => {
            order.push('parent-passive')
            event.preventDefault()
        })
        const activeParent: EventListener = jest.fn((event: Event) => {
            order.push('parent-active')
            event.preventDefault()
        })
        const view = parentTemplate(passiveParent, {
            capture: false,
            passive: true,
            signal: firstController.signal,
        }).render(document.body)
        const section = document.querySelector('section')!
        const button = document.querySelector('button')!
        button.addEventListener('click', () => order.push('button'))

        const passiveEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        })
        button.dispatchEvent(passiveEvent)
        expect(order).toEqual(['button', 'parent-passive'])
        expect(passiveEvent.defaultPrevented).toBe(false)

        order.length = 0
        const add = jest.spyOn(section, 'addEventListener')
        const remove = jest.spyOn(section, 'removeEventListener')
        const activeController = new window.AbortController()
        view.__rebind__(
            parentTemplate(activeParent, {
                capture: true,
                passive: false,
                signal: activeController.signal,
            })
        )
        const activeEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        })
        button.dispatchEvent(activeEvent)

        expect(remove).toHaveBeenCalledTimes(1)
        expect(add).toHaveBeenCalledTimes(1)
        expect(order).toEqual(['parent-active', 'button'])
        expect(activeEvent.defaultPrevented).toBe(true)

        order.length = 0
        add.mockClear()
        remove.mockClear()
        activeController.abort()
        view.__rebind__(
            parentTemplate(passiveParent, {
                capture: true,
                passive: false,
                signal: activeController.signal,
            })
        )
        button.click()
        expect(add).not.toHaveBeenCalled()
        expect(remove).not.toHaveBeenCalled()
        expect(order).toEqual(['button'])

        order.length = 0
        const replacementController = new window.AbortController()
        view.__rebind__(
            parentTemplate(activeParent, {
                capture: true,
                passive: false,
                signal: replacementController.signal,
            })
        )
        button.click()
        expect(remove).toHaveBeenCalledTimes(1)
        expect(add).toHaveBeenCalledTimes(1)
        expect(order).toEqual(['parent-active', 'button'])
        view.unmount()
    })

    it('delegates spread events without replacing their DOM listeners', () => {
        const first: EventListener = jest.fn()
        const next: EventListener = jest.fn()
        const create = (handler: EventListener): HtmlTemplate =>
            html`<button ${{ onclick: handler }}>button</button>`
        const view = create(first).render(document.body)
        const button = document.querySelector('button')!
        const add = jest.spyOn(button, 'addEventListener')
        const remove = jest.spyOn(button, 'removeEventListener')

        view.__rebind__(create(next))
        button.click()

        expect(add).not.toHaveBeenCalled()
        expect(remove).not.toHaveBeenCalled()
        expect(first).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)
        view.unmount()
    })
})
