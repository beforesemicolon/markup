import '../test.common.ts'
import { html } from './html.ts'
import { state } from './state.ts'

describe('HtmlTemplate refs', () => {
    it('should collect same-name refs across own and nested templates without duplicates', () => {
        const child = html`<span ref="item">child</span>`
        const temp = html`<div ref="item">parent</div>${child}`.render(document.body)

        expect(temp.refs.item).toHaveLength(2)
        expect(temp.refs.item[0]).toBeInstanceOf(HTMLDivElement)
        expect(temp.refs.item[1]).toBeInstanceOf(HTMLSpanElement)
    })

    it('should reflect refs from the currently rendered dynamic child', () => {
        const [enabled, setEnabled] = state(true)
        const temp = html`${() =>
            enabled()
                ? html`<span ref="enabled">enabled</span>`
                : html`<span ref="disabled">disabled</span>`
        }`.render(document.body)

        expect(temp.refs.enabled).toHaveLength(1)
        expect(temp.refs.disabled).toBeUndefined()

        setEnabled(false)
        jest.advanceTimersToNextTimer()

        expect(temp.refs.enabled).toBeUndefined()
        expect(temp.refs.disabled).toHaveLength(1)
    })
})
