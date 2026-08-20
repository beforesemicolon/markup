import '../test.common.ts'
import { html } from './html.ts'

describe('html template cache', () => {
    it('should keep distinct tagged template literal shapes separate', () => {
        const renderFirst = (value: string) =>
            html`<div data-value="a,b${value}c"></div>`
        const renderSecond = (value: string) =>
            html`<div data-value="a${value}b,c"></div>`

        expect(renderFirst('X').toString()).toBe(
            '<div data-value="a,bXc"></div>'
        )
        expect(renderSecond('X').toString()).toBe(
            '<div data-value="aXb,c"></div>'
        )
    })

    it('should not reuse values from the first attribute-object invocation', () => {
        const view = (attrs: Record<string, unknown>) => html`<div ${attrs}></div>`

        expect(view({ title: 'one', dataId: 'first' }).toString()).toBe(
            '<div title="one" data-id="first"></div>'
        )
        expect(view({ title: 'two', dataId: 'second' }).toString()).toBe(
            '<div title="two" data-id="second"></div>'
        )
    })

    it('should not cache manually-created string arrays by content identity', () => {
        const first = html(['<span>', '</span>'], 'one')
        const second = html(['<strong>', '</strong>'], 'two')

        expect(first.toString()).toBe('<span>one</span>')
        expect(second.toString()).toBe('<strong>two</strong>')
    })
})
