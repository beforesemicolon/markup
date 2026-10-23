import '../test.common.ts'
import { html, HtmlTemplate } from './html.ts'
import { state } from './state.ts'

describe('custom-element registration before mounting', () => {
    it('classifies mixed observed properties after registration and keeps them reactive', () => {
        const [value, setValue] = state('first')
        const view = html`<registration-property
            one="prefix ${value}"
        ></registration-property>`
        class RegistrationProperty extends HTMLElement {
            static observedAttributes = ['one']
            one = ''
        }
        customElements.define('registration-property', RegistrationProperty)

        view.render(document.body)
        const node = document.body.firstElementChild as RegistrationProperty
        expect(node.one).toBe('prefix first')
        setValue('second')
        jest.runAllTicks()
        expect(node.one).toBe('prefix second')
        expect(node.getAttribute('one')).toBe('prefix second')
        view.unmount()
    })

    it('preserves mixed property whitespace when registration happens after compilation', () => {
        const view = new HtmlTemplate(
            ['<registration-whitespace one=" \n', '\t "></registration-whitespace>'],
            ['value']
        )
        class RegistrationWhitespace extends HTMLElement {
            static observedAttributes = ['one']
            one = ''
        }
        customElements.define('registration-whitespace', RegistrationWhitespace)

        view.render(document.body)
        expect(
            (document.body.firstElementChild as RegistrationWhitespace).one
        ).toBe('value\t ')
        view.unmount()
    })

    it('accepts whitespace around a late-classified event listener tuple', () => {
        const listener = jest.fn()
        const view = new HtmlTemplate(
            ['<registration-event oncustom=" \n', '\t "></registration-event>'],
            [[listener, { once: true }]]
        )
        customElements.define('registration-event', class extends HTMLElement {})

        view.render(document.body)
        const node = document.body.firstElementChild!
        expect(node.hasAttribute('oncustom')).toBe(false)
        node.dispatchEvent(new Event('custom'))
        node.dispatchEvent(new Event('custom'))
        expect(listener).toHaveBeenCalledTimes(1)
        view.unmount()
    })

    it.each([false, true])(
        'rejects mixed native events even if the late definition observes them (registered: %s)',
        (registered) => {
            const tag = `registration-native-${registered}`
            const view = new HtmlTemplate(
                [`<${tag} onclick="prefix `, `"></${tag}>`],
                ['void 0']
            )
            if (registered) {
                customElements.define(
                    tag,
                    class extends HTMLElement {
                        static observedAttributes = ['onclick']
                    }
                )
            }
            const setAttribute = jest.spyOn(Element.prototype, 'setAttribute')
            try {
                expect(() => view.render(document.body)).toThrow(
                    'Event binding "onclick" must contain a single interpolation'
                )
                expect(setAttribute).not.toHaveBeenCalled()
                expect(document.body.childNodes).toHaveLength(0)
            } finally {
                setAttribute.mockRestore()
            }
        }
    )

    it('rejects unresolved mixed events before evaluating or writing other bindings', () => {
        const [value, setValue] = state('value')
        const read = jest.fn(() => value())
        const view = html`<registration-unresolved
            data-value="${read}"
            oncustom="prefix ${read}"
        ></registration-unresolved>`
        const setAttribute = jest.spyOn(Element.prototype, 'setAttribute')
        try {
            expect(() => view.render(document.body)).toThrow(
                'Event binding "oncustom" must contain a single interpolation'
            )
            setValue('next')
            jest.runAllTicks()
            expect(read).not.toHaveBeenCalled()
            expect(setAttribute).not.toHaveBeenCalled()
            expect(document.body.childNodes).toHaveLength(0)
        } finally {
            setAttribute.mockRestore()
        }
    })

    it('rechecks a cached template definition after its custom element is registered', () => {
        const create = (value: string) =>
            html`<registration-cached
                one="prefix ${value}"
            ></registration-cached>`
        const early = create('early')
        expect(() => early.render(document.body)).toThrow(
            'Event binding "one" must contain a single interpolation'
        )

        class RegistrationCached extends HTMLElement {
            static observedAttributes = ['one']
            one = ''
        }
        customElements.define('registration-cached', RegistrationCached)
        const late = create('late').render(document.body)
        expect(
            (document.body.firstElementChild as RegistrationCached).one
        ).toBe('prefix late')
        late.unmount()
    })
})
