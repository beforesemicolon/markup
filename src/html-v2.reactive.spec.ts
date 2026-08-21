import '../test.common.ts'
import { html } from './html-v2.ts'
import { state } from './state.ts'

const flush = async () => {
    await Promise.resolve()
}

describe('HTML V2 reactive integration', () => {
    it('updates reactive content and attributes in place', async () => {
        const [count, setCount] = state(1)
        const host = document.createElement('div')
        const template = html`<div data-count="${count}">${count}</div>`

        template.render(host)
        const node = host.querySelector('div')!

        expect(node.textContent).toBe('1')
        expect(node.getAttribute('data-count')).toBe('1')

        setCount(2)
        await flush()

        expect(host.querySelector('div')).toBe(node)
        expect(node.textContent).toBe('2')
        expect(node.getAttribute('data-count')).toBe('2')
    })

    it('reconciles conditional dependencies on each reactive part run', async () => {
        const [useLeft, setUseLeft] = state(true)
        const [left, setLeft] = state('left')
        const [right, setRight] = state('right')
        const value = () => (useLeft() ? left() : right())
        const host = document.createElement('div')
        const template = html`<span>${value}</span>`

        template.render(host)
        expect(host.textContent).toBe('left')

        setUseLeft(false)
        await flush()
        expect(host.textContent).toBe('right')

        setLeft('stale')
        await flush()
        expect(host.textContent).toBe('right')

        setRight('fresh')
        await flush()
        expect(host.textContent).toBe('fresh')
    })

    it('disposes reactive parts on unmount and recreates them on remount', async () => {
        const [value, setValue] = state('one')
        const firstHost = document.createElement('div')
        const secondHost = document.createElement('div')
        const template = html`<p>${value}</p>`

        template.render(firstHost)
        expect(firstHost.textContent).toBe('one')

        template.unmount()
        setValue('two')
        await flush()
        expect(firstHost.textContent).toBe('')

        template.render(secondHost)
        expect(secondHost.textContent).toBe('two')

        setValue('three')
        await flush()
        expect(secondHost.textContent).toBe('three')
    })

    it('updates reactive spread values without treating event handlers as getters', async () => {
        const [title, setTitle] = state('first')
        const click = jest.fn()
        const attrs = {
            title,
            onclick: click,
        }
        const host = document.createElement('div')
        const template = html`<button ${attrs}>Open</button>`

        template.render(host)
        const button = host.querySelector('button')!
        expect(button.getAttribute('title')).toBe('first')

        button.dispatchEvent(new Event('click'))
        expect(click).toHaveBeenCalledTimes(1)

        setTitle('second')
        await flush()
        expect(button.getAttribute('title')).toBe('second')
        expect(click).toHaveBeenCalledTimes(1)
    })

    it('updates reactive refs', async () => {
        const [name, setName] = state('first')
        const host = document.createElement('div')
        const template = html`<div ref="${name}"></div>`

        template.render(host)
        const node = host.querySelector('div')!
        expect(template.refs.first).toEqual([node])

        setName('second')
        await flush()
        expect(template.refs.first).toBeUndefined()
        expect(template.refs.second).toEqual([node])
    })

    it('updates reactive nested templates while retaining the outer DOM', async () => {
        const [value, setValue] = state('one')
        const nested = () => html`<strong>${value()}</strong>`
        const host = document.createElement('div')
        const template = html`<section>${nested}</section>`

        template.render(host)
        const section = host.querySelector('section')!
        expect(section.textContent).toBe('one')

        setValue('two')
        await flush()

        expect(host.querySelector('section')).toBe(section)
        expect(section.textContent).toBe('two')
    })
})