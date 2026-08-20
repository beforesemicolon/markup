import '../test.common.ts'
import { html } from './html-v2.ts'

describe('HTML V2 non-reactive parity', () => {
    it('renders primitives, Nodes, arrays, nested templates, and function values', () => {
        const node = document.createElement('em')
        node.textContent = 'node'
        const nested = html`<strong ref="nested">nested</strong>`
        const view = html`<div ref="root">${'text'}${node}${[html`<i>one</i>`, 'two']}${nested}${() => 'fn'}</div>`

        view.render(document.body)

        expect(document.body.innerHTML).toBe(
            '<div>text<em>node</em><i>one</i>two<strong>nested</strong>fn</div>'
        )
        expect(view.refs.root).toHaveLength(1)
        expect(view.refs.nested).toHaveLength(1)
    })

    it('renders raw script/style interpolation without creating structure', () => {
        const value = 'sample'
        html`<script>window.value = "${value}"</script><style>.x::after{content:"${value}"}</style>`
            .render(document.body)

        expect(document.body.querySelector('script')?.textContent).toBe(
            'window.value = "sample"'
        )
        expect(document.body.querySelector('style')?.textContent).toBe(
            '.x::after{content:"sample"}'
        )
    })

    it('does not allow a dynamic value to become a tag name', () => {
        const tag = 'section'
        html`<${tag}>value</${tag}>`.render(document.body)

        expect(document.body.querySelector('section')).toBeNull()
        expect(document.body.textContent).toContain('<section>')
    })

    it('uses native property semantics for non-primitive custom-element values', () => {
        const values: unknown[] = []
        class V2Items extends HTMLElement {
            static observedAttributes = ['items']
            set items(value: unknown) {
                values.push(value)
            }
        }
        customElements.define('v2-items', V2Items)

        const items = ['book', 'car']
        html`<v2-items items="${items}"></v2-items>`.render(document.body)

        expect(document.body.innerHTML).toBe('<v2-items></v2-items>')
        expect(values).toEqual([items])
    })

    it('handles DOM and custom events including options', () => {
        const click = jest.fn()
        const active = jest.fn()
        class V2Button extends HTMLElement {
            constructor() {
                super()
                this.addEventListener('click', () =>
                    this.dispatchEvent(new CustomEvent('active'))
                )
            }
        }
        customElements.define('v2-button', V2Button)

        const view = html`<button ref="btn" onclick="${[click, { once: true }]}">click</button><v2-button ref="custom" onactive="${active}">custom</v2-button>`
            .render(document.body)
        const btn = view.refs.btn[0] as HTMLButtonElement
        const custom = view.refs.custom[0] as HTMLElement

        btn.click()
        btn.click()
        custom.click()

        expect(click).toHaveBeenCalledTimes(1)
        expect(active).toHaveBeenCalledTimes(1)
        expect(document.body.innerHTML).toBe(
            '<button>click</button><v2-button>custom</v2-button>'
        )
    })

    it('treats observed custom-element on* names as properties rather than events', () => {
        const values: unknown[] = []
        class V2One extends HTMLElement {
            static observedAttributes = ['one']
            set one(value: unknown) {
                values.push(value)
            }
        }
        customElements.define('v2-one', V2One)

        expect(() => html`<v2-one one="${2}"></v2-one>`.render(document.body)).not.toThrow()
        expect(values).toEqual([2])
    })

    it('preserves spread precedence and source attribute order', () => {
        const spreadClick = jest.fn()
        const explicitClick = jest.fn()
        const props = {
            ariaLabel: 'count up button',
            onClick: spreadClick,
            type: 'submit',
            ref: 'spread-ref',
        }

        const view = html`<button ${props} type="button" onclick="${explicitClick}" ref="btn">+</button>`
            .render(document.body)
        const btn = view.refs.btn[0] as HTMLButtonElement

        expect(btn.outerHTML).toBe(
            '<button aria-label="count up button" type="button">+</button>'
        )
        expect(view.refs['spread-ref']).toBeUndefined()
        btn.click()
        expect(spreadClick).not.toHaveBeenCalled()
        expect(explicitClick).toHaveBeenCalledTimes(1)
    })

    it('matches boolean and nil attribute semantics', () => {
        const view = html`<p hidden="${false}" id="${undefined}">hidden</p><button disabled="${true}" type="${null}">button</button><input type="checkbox" checked="${false}">`
            .render(document.body)

        expect(document.body.innerHTML).toBe(
            '<p>hidden</p><button disabled="true">button</button><input type="checkbox">'
        )
        const [, button, input] = Array.from(document.body.children) as HTMLElement[]
        expect((button as HTMLButtonElement).disabled).toBe(true)
        expect((input as HTMLInputElement).checked).toBe(false)
        expect(view.mounted).toBe(true)
    })

    it('preserves lifecycle and movement behavior', () => {
        const mount = jest.fn(() => cleanup)
        const cleanup = jest.fn()
        const move = jest.fn()
        const hostA = document.createElement('div')
        const hostB = document.createElement('div')
        document.body.append(hostA, hostB)

        const view = html`<span>value</span>`.onMount(mount).onMove(move)
        view.render(hostA)
        view.render(hostB)

        expect(mount).toHaveBeenCalledTimes(1)
        expect(move).toHaveBeenCalledTimes(1)
        expect(hostA.innerHTML).toBe('')
        expect(hostB.innerHTML).toBe('<span>value</span>')

        view.unmount()
        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(hostB.innerHTML).toBe('')
    })

    it('serializes unmounted templates', () => {
        expect(html`<div>${'value'}</div>`.toString()).toBe('<div>value</div>')
    })
})
