import '../../test.common.ts'
import { html } from '../html.ts'
import { repeat } from './repeat.helper.ts'
import { state } from '../state.ts'

type Item = {
    id: number
    name: string
    active?: boolean
    kind?: 'span' | 'strong'
    onClick?: () => void
}

describe('repeat keyed template rebinding', () => {
    it('reuses DOM identity for immutable keyed primitive updates', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'first', active: false },
        ])
        const renderer = jest.fn(
            (item: Item) => html`<span
                class="${item.active ? 'active' : ''}"
                data-name="${item.name}"
            >${item.name}</span>`
        )
        const view = html`${repeat(items, renderer, {
            key: (item) => item.id,
        })}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'updated', active: true }])
        jest.advanceTimersToNextTimer()

        const updatedNode = document.body.querySelector('span')
        expect(updatedNode).toBe(firstNode)
        expect(updatedNode?.textContent).toBe('updated')
        expect(updatedNode?.className).toBe('active')
        expect(updatedNode?.getAttribute('data-name')).toBe('updated')
        expect(renderer).toHaveBeenCalledTimes(2)
    })

    it('reuses each keyed row independently', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one' },
            { id: 2, name: 'two' },
        ])
        const view = html`${repeat(
            items,
            (item) => html`<span>${item.name}</span>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const before = Array.from(document.body.querySelectorAll('span'))

        setItems([
            { id: 1, name: 'ONE' },
            { id: 2, name: 'TWO' },
        ])
        jest.advanceTimersToNextTimer()

        const after = Array.from(document.body.querySelectorAll('span'))
        expect(after[0]).toBe(before[0])
        expect(after[1]).toBe(before[1])
        expect(after.map((node) => node.textContent)).toEqual([
            'ONE',
            'TWO',
        ])
    })

    it('reuses keyed rows while updating event handlers', () => {
        const firstHandler = jest.fn()
        const nextHandler = jest.fn()
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one', onClick: firstHandler },
        ])
        const view = html`${repeat(
            items,
            (item) =>
                html`<button onclick="${item.onClick}">${item.name}</button>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const button = document.body.querySelector('button')!
        button.click()

        setItems([{ id: 1, name: 'ONE', onClick: nextHandler }])
        jest.advanceTimersToNextTimer()

        const updatedButton = document.body.querySelector('button')!
        updatedButton.click()

        expect(updatedButton).toBe(button)
        expect(updatedButton.textContent).toBe('ONE')
        expect(firstHandler).toHaveBeenCalledTimes(1)
        expect(nextHandler).toHaveBeenCalledTimes(1)
    })

    it('falls back to replacement when the template shape changes', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one', kind: 'span' },
        ])
        const view = html`${repeat(
            items,
            (item) =>
                item.kind === 'span'
                    ? html`<span>${item.name}</span>`
                    : html`<strong>${item.name}</strong>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'one', kind: 'strong' }])
        jest.advanceTimersToNextTimer()

        const strong = document.body.querySelector('strong')
        expect(strong).not.toBeNull()
        expect(strong).not.toBe(firstNode)
        expect(document.body.querySelector('span')).toBeNull()
    })

    it('falls back for lifecycle templates to preserve mount cleanup behavior', () => {
        const mount = jest.fn(() => cleanup)
        const cleanup = jest.fn()
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one' },
        ])
        const view = html`${repeat(
            items,
            (item) => html`<span>${item.name}</span>`.onMount(mount),
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'ONE' }])
        jest.advanceTimersToNextTimer()

        expect(document.body.querySelector('span')).not.toBe(firstNode)
        expect(mount).toHaveBeenCalledTimes(2)
        expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it('falls back for reactive function slots', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one' },
        ])
        const view = html`${repeat(
            items,
            (item) => html`<span>${() => item.name}</span>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'ONE' }])
        jest.advanceTimersToNextTimer()

        expect(document.body.querySelector('span')).not.toBe(firstNode)
        expect(document.body.textContent).toBe('ONE')
    })

    it('falls back for nested template values', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one' },
        ])
        const view = html`${repeat(
            items,
            (item) => html`<span>${html`<b>${item.name}</b>`}</span>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'ONE' }])
        jest.advanceTimersToNextTimer()

        expect(document.body.querySelector('span')).not.toBe(firstNode)
        expect(document.body.innerHTML).toBe('<span><b>ONE</b></span>')
    })

    it('keeps the existing stable-reference renderer cache behavior', () => {
        const item = { id: 1, name: 'one' }
        const renderer = jest.fn(
            (value: Item) => html`<span>${value.name}</span>`
        )
        const read = repeat([item], renderer, {
            key: (value) => value.id,
        })

        const first = read() as unknown[]
        const second = read() as unknown[]

        expect(second[0]).toBe(first[0])
        expect(renderer).toHaveBeenCalledTimes(1)
    })
})
