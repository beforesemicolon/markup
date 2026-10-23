import '../test.common.ts'
import { html } from './html.ts'
import { repeat } from './helpers/repeat.helper.ts'
import { state } from './state.ts'

const flush = () => jest.advanceTimersToNextTimer()

describe('keyed row rebinding', () => {
    it('keeps reactive row DOM and replaces captured dependencies', () => {
        const [oldDetail, setOldDetail] = state('old')
        const [newDetail, setNewDetail] = state('new')
        const reads = jest.fn((detail: () => string) => detail())
        const [items, setItems] = state([
            { id: 1, name: 'one', detail: oldDetail },
        ])
        const view = html`${repeat(
            items,
            (item) =>
                html`<label
                    ><input />${() => `${item.name}: ${reads(item.detail)}`}</label
                >`,
            { key: (item) => item.id }
        )}`
        view.render(document.body)
        const label = document.querySelector('label')!
        const input = document.querySelector('input')!
        input.value = 'unsaved'
        input.focus()
        input.setSelectionRange(1, 4)

        setItems([{ id: 1, name: 'ONE', detail: newDetail }])
        flush()
        expect(document.querySelector('label')).toBe(label)
        expect(document.querySelector('input')).toBe(input)
        expect(document.activeElement).toBe(input)
        expect(input.value).toBe('unsaved')
        expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4])
        expect(label.textContent).toBe('ONE: new')

        reads.mockClear()
        setOldDetail('stale')
        flush()
        expect(reads).not.toHaveBeenCalled()
        setNewDetail('fresh')
        flush()
        expect(label.textContent).toBe('ONE: fresh')
        expect(reads).toHaveBeenCalledTimes(1)

        view.unmount()
        reads.mockClear()
        setNewDetail('removed')
        flush()
        expect(reads).not.toHaveBeenCalled()
        expect(document.body.childNodes).toHaveLength(0)
    })

    it('replaces a custom-element row when reactive children bind its instance state', () => {
        const tagName = 'rebind-instance-state'

        class RebindInstanceState extends HTMLElement {
            connectedCallback(): void {
                this.dataset.initialValue =
                    this.getAttribute('data-value') ?? ''
            }
        }

        customElements.define(tagName, RebindInstanceState)
        const [items, setItems] = state([{ id: 1, name: 'first' }])
        const view = html`${repeat(
            items,
            (item) => html`<rebind-instance-state
                data-value="${item.name}"
                >${() => item.name}</rebind-instance-state
            >`,
            { key: (item) => item.id }
        )}`.render(document.body)
        const first = document.querySelector<HTMLElement>(tagName)!

        setItems([{ id: 1, name: 'second' }])
        flush()
        const second = document.querySelector<HTMLElement>(tagName)!

        expect(second).not.toBe(first)
        expect(second.dataset.initialValue).toBe('second')
        expect(second.textContent).toBe('second')
        view.unmount()
    })

    it('keeps an attribute-only custom-element row during a compatible rebind', () => {
        const tagName = 'rebind-attribute-state'
        customElements.define(tagName, class extends HTMLElement {})
        const [items, setItems] = state([{ id: 1, name: 'first' }])
        const view = html`${repeat(
            items,
            (item) =>
                html`<rebind-attribute-state
                    data-value="${item.name}"
                ></rebind-attribute-state>`,
            { key: (item) => item.id }
        )}`.render(document.body)
        const element = document.querySelector(tagName)!

        setItems([{ id: 1, name: 'second' }])
        flush()

        expect(document.querySelector(tagName)).toBe(element)
        expect(element.getAttribute('data-value')).toBe('second')
        view.unmount()
    })

    it('keeps a custom-element shell during a direct child update', () => {
        const tagName = 'rebind-parent-shell'
        customElements.define(tagName, class extends HTMLElement {})
        const [label, setLabel] = state('first')
        const renderShell = () => {
            const current = label()
            return html`<rebind-parent-shell
                ><section>${() => current}</section></rebind-parent-shell
            >`
        }
        const view = html`${renderShell}`.render(document.body)
        const shell = document.querySelector(tagName)!
        const section = shell.querySelector('section')!

        setLabel('second')
        flush()

        expect(document.querySelector(tagName)).toBe(shell)
        expect(shell.querySelector('section')).toBe(section)
        expect(section.textContent).toBe('second')
        view.unmount()
    })

    it.each([false, true])(
        'preserves one text representation through slot changes (initially reactive: %s)',
        (reactive) => {
            const [value, setValue] = state('start')
            const [items, setItems] = state<{ id: number; content: unknown }[]>(
                [{ id: 1, content: reactive ? value : 'start' }]
            )
            const view = html`${repeat(
                items,
                (item) => html`<section>${item.content}</section>`,
                { key: (item) => item.id }
            )}`
            view.render(document.body)
            const section = document.querySelector('section')!
            const text = [...section.childNodes].find(
                (node) => node.textContent === 'start'
            )

            setItems([{ id: 1, content: () => `reactive ${value()}` }])
            flush()
            expect(document.querySelector('section')).toBe(section)
            expect(section.textContent).toBe('reactive start')
            expect(section.contains(text!)).toBe(true)
            setValue('updated')
            flush()
            expect(section.textContent).toBe('reactive updated')

            setItems([{ id: 1, content: 'plain' }])
            flush()
            expect(section.textContent).toBe('plain')
            setValue('ignored')
            flush()
            expect(section.textContent).toBe('plain')

            setItems([{ id: 1, content: html`<b>nested</b>` }])
            flush()
            expect(document.querySelector('section')).toBe(section)
            expect(section.innerHTML).toBe('<b>nested</b>')
            setItems([{ id: 1, content: () => value() }])
            flush()
            expect(section.textContent).toBe('ignored')
            expect(section.querySelector('b')).toBeNull()
            setValue('final')
            flush()
            expect(section.textContent).toBe('final')
            view.unmount()
        }
    )

    it('preserves nested template DOM, reactive dependencies, and mount cleanup', () => {
        const cleanup = jest.fn()
        const mount = jest.fn(() => cleanup)
        const [detail, setDetail] = state('detail')
        const [items, setItems] = state([{ id: 1, name: 'one' }])
        const view = html`${repeat(
            items,
            (item) =>
                html`<section>
                    ${html`<b>${() => `${item.name}: ${detail()}`}</b>`.onMount(mount)}
                </section>`,
            { key: (item) => item.id }
        )}`
        view.render(document.body)
        const section = document.querySelector('section')!
        const nested = document.querySelector('b')!
        setItems([{ id: 1, name: 'ONE' }])
        flush()
        expect(document.querySelector('section')).toBe(section)
        expect(document.querySelector('b')).toBe(nested)
        expect(nested.textContent).toBe('ONE: detail')
        setDetail('changed')
        flush()
        expect(nested.textContent).toBe('ONE: changed')
        expect(mount).toHaveBeenCalledTimes(1)
        expect(cleanup).not.toHaveBeenCalled()
        setItems([])
        flush()
        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(document.body.textContent).toBe('')
        view.unmount()
        expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it('replaces only a nested child when its template definition changes', () => {
        const cleanup = jest.fn()
        const mount = jest.fn(() => cleanup)
        const [items, setItems] = state([{ id: 1, strong: false }])
        const view = html`${repeat(
            items,
            (item) =>
                html`<section>
                    <input />${(item.strong ? html`<strong>new</strong>` : html`<b>old</b>`).onMount(mount)}
                </section>`,
            { key: (item) => item.id }
        )}`
        view.render(document.body)
        const section = document.querySelector('section')!
        const input = document.querySelector('input')!
        input.value = 'unsaved'
        input.focus()
        setItems([{ id: 1, strong: true }])
        flush()
        expect(document.querySelector('section')).toBe(section)
        expect(document.querySelector('input')).toBe(input)
        expect(document.activeElement).toBe(input)
        expect(input.value).toBe('unsaved')
        expect(section.querySelector('b')).toBeNull()
        expect(section.querySelector('strong')?.textContent).toBe('new')
        expect(mount).toHaveBeenCalledTimes(2)
        expect(cleanup).toHaveBeenCalledTimes(1)
        view.unmount()
        expect(cleanup).toHaveBeenCalledTimes(2)
    })

    it('retains mount ownership but refreshes update, move, and future mount callbacks', () => {
        const mounts: string[] = []
        const updates: string[] = []
        const moves: string[] = []
        const cleanups: string[] = []
        let retained: ReturnType<typeof html> | undefined
        const [items, setItems] = state([{ id: 1, name: 'one' }])
        const view = html`${repeat(
            items,
            (item) =>
                html`<span>${item.name}</span>`
                    .onMount((template) => {
                        retained = template
                        mounts.push(item.name)
                        return () => {
                            cleanups.push(item.name)
                        }
                    })
                    .onUpdate(() => {
                        updates.push(item.name)
                    })
                    .onMove(() => {
                        moves.push(item.name)
                    }),
            { key: (item) => item.id }
        )}`
        view.render(document.body)
        const span = document.querySelector('span')!
        setItems([{ id: 1, name: 'ONE' }])
        flush()
        expect(document.querySelector('span')).toBe(span)
        expect(mounts).toEqual(['one'])
        expect(cleanups).toEqual([])
        expect(updates).toEqual(['ONE'])

        const target = document.createElement('div')
        document.body.append(target)
        retained!.render(target)
        expect(moves).toEqual(['ONE'])
        retained!.unmount()
        expect(cleanups).toEqual(['one'])
        retained!.render(target)
        expect(mounts).toEqual(['one', 'ONE'])
        retained!.unmount()
        expect(cleanups).toEqual(['one', 'ONE'])
        view.unmount()
    })

    it('rejects incompatible or already-mounted candidates before changing retained output', () => {
        const make = (value: string) => html`<span>${value}</span>`
        const current = make('current').render(document.body)
        const other = make('other').render(document.body)
        const node = current.childNodes[0]
        expect(current.__rebind__(other)).toBe(false)
        expect(current.__rebind__(html`<b>different</b>`)).toBe(false)
        expect(current.__rebind__(current)).toBe(false)
        expect(current.childNodes[0]).toBe(node)
        expect(node.textContent).toBe('current')
        expect(other.childNodes[0].textContent).toBe('other')
        current.unmount()
        other.unmount()
    })
})

describe('repeat positional invalidation', () => {
    it.each([false, true])(
        'updates position-dependent output while retaining rows (explicit keys: %s)',
        (keyed) => {
            const initial = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
            const [items, setItems] = state(initial)
            const renderer = jest.fn(
                (item: { id: string }, index: number) =>
                    html`<li data-id="${item.id}" aria-posinset="${index + 1}">
                        ${item.id}: ${index + 1}
                    </li>`
            )
            const view = html`<ul>
                ${repeat(items, renderer, keyed ? { key: (item) => item.id } : undefined)}
            </ul>`
            view.render(document.body)
            const rows = new Map(
                [...document.querySelectorAll('li')].map((node) => [
                    node.dataset.id,
                    node,
                ])
            )
            renderer.mockClear()

            setItems([...initial].reverse())
            flush()
            expect(
                [...document.querySelectorAll('li')].map((node) => [
                    node.textContent?.trim(),
                    node.getAttribute('aria-posinset'),
                ])
            ).toEqual([
                ['c: 1', '1'],
                ['b: 2', '2'],
                ['a: 3', '3'],
            ])
            expect(renderer).toHaveBeenCalledTimes(2)
            for (const node of document.querySelectorAll('li'))
                expect(node).toBe(rows.get(node.dataset.id))

            renderer.mockClear()
            const prepended = [{ id: 'd' }, ...initial]
            setItems(prepended)
            flush()
            expect(
                [...document.querySelectorAll('li')].map(
                    (node) => node.textContent?.trim()
                )
            ).toEqual(['d: 1', 'a: 2', 'b: 3', 'c: 4'])
            expect(renderer).toHaveBeenCalledTimes(4)
            renderer.mockClear()
            setItems(prepended.slice(1))
            flush()
            expect(
                [...document.querySelectorAll('li')].map(
                    (node) => node.textContent?.trim()
                )
            ).toEqual(['a: 1', 'b: 2', 'c: 3'])
            expect(renderer).toHaveBeenCalledTimes(3)
            for (const node of document.querySelectorAll('li'))
                expect(node).toBe(rows.get(node.dataset.id))
            renderer.mockClear()
            setItems([...initial])
            flush()
            expect(renderer).not.toHaveBeenCalled()
            view.unmount()
        }
    )
})
