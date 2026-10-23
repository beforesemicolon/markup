import { html, HtmlTemplate } from './html.ts'
import { state } from './state.ts'
import { repeat } from './helpers/repeat.helper.ts'

const flush = async () => {
    await Promise.resolve()
    await Promise.resolve()
}

describe('accessible DOM updates', () => {
    const mounted: HtmlTemplate[] = []

    const mount = (view: HtmlTemplate) => {
        mounted.push(view)
        return view.render(document.body)
    }

    afterEach(() => {
        for (const view of mounted.splice(0)) view.unmount()
        document.body.replaceChildren()
        document.getSelection()?.removeAllRanges()
        jest.restoreAllMocks()
    })

    it('removes inert after a reactive boolean changes to false', async () => {
        const [inert, setInert] = state(true)
        mount(html`<main inert="${inert}"><button>Continue</button></main>`)
        const main = document.querySelector('main')!
        expect(main.hasAttribute('inert')).toBe(true)

        setInert(false)
        await flush()
        expect(main.hasAttribute('inert')).toBe(false)

        setInert(true)
        await flush()
        expect(main.hasAttribute('inert')).toBe(true)
    })

    it('omits false inert values in initial attributes and spread updates', async () => {
        const [inert, setInert] = state(false)
        mount(
            html`<section inert="${false}"></section>
                <main ${{ inert }}></main>`
        )
        expect(document.querySelector('section')!.hasAttribute('inert')).toBe(
            false
        )
        const main = document.querySelector('main')!
        expect(main.hasAttribute('inert')).toBe(false)
        setInert(true)
        await flush()
        expect(main.hasAttribute('inert')).toBe(true)
        setInert(false)
        await flush()
        expect(main.hasAttribute('inert')).toBe(false)
    })

    it.each(['single-root', 'fragment'] as const)(
        'preserves focused input and backward selection while reordering %s rows',
        async (shape) => {
            const original = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
            const [items, setItems] = state(original)
            const row = (item: { id: string }) =>
                shape === 'single-root'
                    ? html`<label data-row="${item.id}"
                          ><input aria-label="${item.id}" value="abcdef"
                      /></label>`
                    : html`<label data-row="${item.id}">${item.id}</label
                          ><input aria-label="${item.id}" value="abcdef" />`
            mount(
                html`<section>
                    ${repeat(items, row, { key: (item) => item.id })}
                </section>`
            )
            const inputs = Array.from(document.querySelectorAll('input'))
            const focused = inputs[2]
            focused.focus()
            focused.setSelectionRange(1, 4, 'backward')

            setItems([...original].reverse())
            await flush()

            expect(Array.from(document.querySelectorAll('input'))).toEqual(
                [...inputs].reverse()
            )
            expect(document.activeElement).toBe(focused)
            expect([
                focused.selectionStart,
                focused.selectionEnd,
                focused.selectionDirection,
            ]).toEqual([1, 4, 'backward'])
        }
    )

    it('preserves focus inside an open shadow root when raw nodes reorder', async () => {
        const first = document.createElement('div')
        const host = document.createElement('div')
        const shadow = host.attachShadow({ mode: 'open' })
        const input = document.createElement('input')
        input.value = 'abcdef'
        shadow.append(input)
        const middle = document.createElement('div')
        const [items, setItems] = state([first, middle, host])
        mount(html`<section>${items}</section>`)
        input.focus()
        input.setSelectionRange(2, 5)

        setItems([host, middle, first])
        await flush()

        expect(document.activeElement).toBe(host)
        expect(shadow.activeElement).toBe(input)
        expect([input.selectionStart, input.selectionEnd]).toEqual([2, 5])
    })

    it('preserves contenteditable focus and selection direction on reorder', async () => {
        const first = document.createElement('div')
        const editor = document.createElement('div')
        editor.setAttribute('contenteditable', 'true')
        editor.tabIndex = 0
        editor.textContent = 'editable'
        const text = editor.firstChild!
        const middle = document.createElement('div')
        const [items, setItems] = state([first, middle, editor])
        mount(html`<section>${items}</section>`)
        editor.focus()
        const selection = document.getSelection()!
        selection.setBaseAndExtent(text, 6, text, 2)

        setItems([editor, middle, first])
        await flush()

        expect(document.activeElement).toBe(editor)
        expect([
            selection.anchorNode,
            selection.anchorOffset,
            selection.focusNode,
            selection.focusOffset,
        ]).toEqual([text, 6, text, 2])
    })

    it('preserves focus when a mounted fragment moves or replaces another node', () => {
        const left = document.createElement('section')
        const right = document.createElement('section')
        const target = document.createElement('p')
        left.append(target)
        document.body.append(left, right)
        const view = html`<span>Label</span><input value="abcdef" />`
        mounted.push(view)
        view.render(left)
        const input = left.querySelector('input')!
        input.focus()
        input.setSelectionRange(1, 3)

        view.render(right)
        expect(document.activeElement).toBe(input)
        expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3])

        view.replace(target)
        expect(target.isConnected).toBe(false)
        expect(document.activeElement).toBe(input)
        expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3])
    })

    it('does not restore focus to a row that has been removed', async () => {
        const first = document.createElement('input')
        const removed = document.createElement('input')
        const [items, setItems] = state([first, removed])
        mount(html`<section>${items}</section>`)
        removed.focus()
        setItems([first])
        await flush()
        expect(removed.isConnected).toBe(false)
        expect(document.activeElement).toBe(document.body)
    })

    it('treats replacement of its own root or descendant as a no-op', () => {
        const view = mount(html`<label><input value="retained" /></label>`)
        const root = view.childNodes[0]
        const input = document.querySelector('input')!
        input.focus()
        view.replace(root)
        view.replace(input)
        view.replace(view)
        expect(view.mounted).toBe(true)
        expect(view.childNodes).toEqual([root])
        expect(root.isConnected).toBe(true)
        expect(document.activeElement).toBe(input)
    })
})
