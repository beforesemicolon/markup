import { moveNodesBefore } from './move-nodes-before.ts'

describe('DOM move interaction restoration', () => {
    afterEach(() => {
        document.body.replaceChildren()
        document.getSelection()?.removeAllRanges()
    })

    it('clamps a contenteditable selection when reconnect callbacks shorten its text', () => {
        class ShrinkingEditor extends HTMLElement {
            connections = 0
            connectedCallback() {
                if (++this.connections > 1)
                    this.querySelector('div')!.firstChild!.nodeValue = 'x'
            }
        }
        customElements.define('shrinking-editor', ShrinkingEditor)
        const host = document.createElement('shrinking-editor')
        const editor = document.createElement('div')
        editor.tabIndex = 0
        editor.setAttribute('contenteditable', 'true')
        editor.textContent = 'editable'
        host.append(editor)
        const before = document.createElement('p')
        document.body.append(before, host)
        editor.focus()
        const text = editor.firstChild!
        const selection = document.getSelection()!
        selection.setBaseAndExtent(text, 6, text, 2)

        expect(() =>
            moveNodesBefore([host], document.body, before)
        ).not.toThrow()
        expect(document.body.firstChild).toBe(host)
        expect(document.activeElement).toBe(editor)
        expect([
            selection.anchorNode,
            selection.anchorOffset,
            selection.focusNode,
            selection.focusOffset,
        ]).toEqual([text, 1, text, 1])
    })

    it('does not abort a move when reconnect callbacks remove input selection support', () => {
        class ChangingInput extends HTMLElement {
            connections = 0
            connectedCallback() {
                if (++this.connections > 1)
                    this.querySelector('input')!.type = 'number'
            }
        }
        customElements.define('changing-input', ChangingInput)
        const host = document.createElement('changing-input')
        const input = document.createElement('input')
        input.value = '12345'
        host.append(input)
        const before = document.createElement('p')
        document.body.append(before, host)
        input.focus()
        input.setSelectionRange(1, 4)

        expect(() =>
            moveNodesBefore([host], document.body, before)
        ).not.toThrow()
        expect(document.body.firstChild).toBe(host)
        expect(input.type).toBe('number')
        expect(document.activeElement).toBe(input)
    })

    it('respects focus deliberately redirected by a connection callback', () => {
        const destination = document.createElement('input')
        class RedirectingFocus extends HTMLElement {
            connections = 0
            connectedCallback() {
                if (++this.connections > 1) destination.focus()
            }
        }
        customElements.define('redirecting-focus', RedirectingFocus)
        const host = document.createElement('redirecting-focus')
        const input = document.createElement('input')
        host.append(input)
        document.body.append(destination, host)
        input.focus()

        moveNodesBefore([host], document.body, destination)
        expect(document.activeElement).toBe(destination)
    })

    it('inserts new and cross-root nodes without calling the restricted move API', () => {
        const parent = document.createElement('section')
        document.body.append(parent)
        const nativeMove = jest.fn(() => {
            throw new Error('invalid native move')
        })
        Object.defineProperty(parent, 'moveBefore', { value: nativeMove })
        const detached = document.createElement('span')
        const fragment = document.createDocumentFragment()
        fragment.append(document.createElement('b'))
        const otherRoot = document.createDocumentFragment()
        const detachedChild = document.createElement('em')
        otherRoot.append(detachedChild)

        moveNodesBefore([detached, fragment, detachedChild], parent, null)
        expect(Array.from(parent.children).map((el) => el.localName)).toEqual([
            'span',
            'b',
            'em',
        ])
        expect(nativeMove).not.toHaveBeenCalled()
    })
})
