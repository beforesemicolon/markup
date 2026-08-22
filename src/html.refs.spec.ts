import '../test.common.ts'
import { html } from './html.ts'
import { effect, state } from './state.ts'
import { when } from './helpers/when.helper.ts'

describe('HtmlTemplate refs', () => {
    it('should collect same-name refs across own and nested templates without duplicates', () => {
        const child = html`<span ref="item">child</span>`
        const temp = html`<div ref="item">parent</div>${child}`.render(document.body)

        expect(temp.refs.item).toHaveLength(2)
        expect(temp.refs.item).toEqual(
            expect.arrayContaining([
                expect.any(HTMLDivElement),
                expect.any(HTMLSpanElement),
            ])
        )
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

    it('should update dynamic refs before user effects run', () => {
        const [formVisible, setFormVisible] = state(false)
        const form = html`<form ref="form"></form>`
        const button = html`<button ref="btn">show form</button>`
        const app = html`
            <h2 ref="heading">Todos app</h2>
            ${when(formVisible, form, button)}
        `
        let observedAppRefs: string[] = []
        let observedFormRefs: string[] = []

        const dispose = effect(() => {
            if (!formVisible()) return
            observedAppRefs = Object.keys(app.refs)
            observedFormRefs = Object.keys(form.refs)
        })

        app.render(document.body)
        setFormVisible(true)
        jest.advanceTimersToNextTimer()

        expect(observedAppRefs).toEqual(
            expect.arrayContaining(['heading', 'form'])
        )
        expect(observedAppRefs).not.toContain('btn')
        expect(observedFormRefs).toEqual(['form'])

        dispose()
        app.unmount()
    })

    it('should render state derived by a preceding user effect', () => {
        const [source, setSource] = state(0)
        const [derived, setDerived] = state(0)
        const app = html`<p ref="summary">${() =>
            `${source()}:${derived()}`}</p>`
        const dispose = effect(() => setDerived(source() * 2))

        app.render(document.body)
        setSource(2)
        jest.advanceTimersToNextTimer()

        expect(app.refs.summary[0].textContent).toBe('2:4')

        dispose()
        app.unmount()
    })
})
