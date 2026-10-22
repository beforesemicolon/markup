import '../test.common.ts'
import { html, HtmlTemplate, unsafeHTML } from './html.ts'
import { state } from './state.ts'

const parse = (source: string) => {
    const template = document.createElement('template')
    template.innerHTML = source
    return template.content
}

describe('HTML serialization boundaries', () => {
    const payload = '<img src=x data-injected="true"> & <b>text</b>\u00a0'

    it.each([false, true])('escapes root text (mounted: %s)', (mounted) => {
        const view = html`${payload}`
        if (mounted) view.render(document.body)
        const output = view.toString()
        const parsed = parse(output)

        expect(output).toContain('&lt;img')
        expect(output).toContain('&amp;')
        expect(output).toContain('&nbsp;')
        expect(parsed.querySelector('img, b')).toBeNull()
        expect(parsed.textContent).toBe(payload)
        expect(view.mounted).toBe(mounted)
        if (mounted) expect(document.body.textContent).toBe(payload)
        view.unmount()
    })

    it('escapes arrays, nested templates, DOM Text nodes and reactive root text', () => {
        const [value, setValue] = state('initial')
        const view =
            html`${[document.createTextNode(payload), html`<b>${payload}</b>`]}${value}`.render(
                document.body
            )
        setValue(payload)
        jest.runAllTicks()
        const parsed = parse(view.toString())

        expect(parsed.querySelector('img')).toBeNull()
        expect(parsed.querySelectorAll('b')).toHaveLength(1)
        expect(parsed.textContent).toBe(payload.repeat(3))
        view.unmount()
    })

    it('preserves comments and explicit trusted raw markup', () => {
        expect(
            html`<!-- <b>comment</b> -->${'&'}${unsafeHTML('<strong>trusted</strong>')}`.toString()
        ).toBe('<!-- <b>comment</b> -->&amp;<strong>trusted</strong>')
    })

    it.each(['>text', '->text', 'a<!--b', 'a-->b', 'a--!>b', 'a<!-'])(
        'rejects comment data that cannot safely round-trip: %s',
        (data) => {
            const view = html`${document.createComment(data)}`
            expect(() => view.toString()).toThrow(
                'Cannot serialize an invalid HTML comment.'
            )
            expect(view.mounted).toBe(false)
        }
    )

    it.each([
        'script',
        'style',
        'xmp',
        'iframe',
        'noembed',
        'noframes',
        'noscript',
    ])('rejects a closing-tag breakout in <%s>', (tag) => {
        const content = `</${tag.toUpperCase()} ><img data-injected>`
        const view = new HtmlTemplate([`<${tag}>`, `</${tag}>`], [content])
        expect(() => view.toString()).toThrow(
            `Cannot serialize unsafe content inside <${tag}>`
        )
        expect(view.mounted).toBe(false)
    })

    it('rejects JSON script breakouts at any depth, including nested template contents', () => {
        const json = JSON.stringify({ value: '</script><img data-injected>' })
        const view = html`<section>
            <template
                ><script type="application/json">
                    ${json}
                </script></template
            >
        </section>`
        expect(() => view.toString()).toThrow(
            'Cannot serialize unsafe content inside <script>'
        )
    })

    it.each(['textarea', 'title'])(
        'rejects DOM-created comment breakouts in <%s>',
        (tag) => {
            const comment = document.createComment(
                `</${tag}><img data-injected>`
            )
            const view = new HtmlTemplate([`<${tag}>`, `</${tag}>`], [comment])
            expect(() => view.toString()).toThrow(
                `Cannot serialize unsafe content inside <${tag}>`
            )
        }
    )

    it('escapes ordinary textarea and title text without rejecting closing-tag characters', () => {
        const output = html`<textarea>
${'</textarea><img data-injected>'}</textarea
            ><title>${'</title>'}</title>`.toString()
        const parsed = parse(output)
        expect(parsed.querySelector('img')).toBeNull()
        expect(parsed.querySelector('textarea')!.textContent).toBe(
            '</textarea><img data-injected>'
        )
        expect(parsed.querySelector('title')!.textContent).toBe('</title>')
    })

    it.each(['<!--', '<ScRiPt>', '<!--<script>'])(
        'rejects script parser control sequences: %s',
        (content) => {
            expect(() =>
                html`<script type="application/json">
                    ${content}
                </script>`.toString()
            ).toThrow('Cannot serialize unsafe content inside <script>')
        }
    )

    it('validates raw text across adjacent nodes without changing a mounted template', () => {
        // Keep an exact child interpolation: whitespace changes this to a raw-text part.
        // prettier-ignore
        const view = html`<script type="application/json">${['</scr', 'ipt><img data-injected>']}</script>`.render(document.body)
        const script = document.body.querySelector('script')!
        const nodes = [...script.childNodes]

        expect(() => view.toString()).toThrow(
            'Cannot serialize unsafe content inside <script>'
        )
        expect(view.mounted).toBe(true)
        expect([...script.childNodes]).toEqual(nodes)
        expect(script.textContent).toBe('</script><img data-injected>')
        view.unmount()
    })

    it('round-trips JSON data when less-than signs are JSON-escaped', () => {
        const data = {
            value: '</script><img data-injected><!--<script>',
            ampersand: '&',
        }
        const json = JSON.stringify(data).replace(/</g, '\\u003c')
        const parsed = parse(
            html`<script type="application/json">
                ${json}
            </script>`.toString()
        )

        expect(parsed.querySelector('img')).toBeNull()
        expect(parsed.querySelectorAll('script')).toHaveLength(1)
        expect(
            JSON.parse(parsed.querySelector('script')!.textContent!)
        ).toEqual(data)
    })

    it('preserves safe script/style content and foreign-namespace text', () => {
        // prettier-ignore
        const script = html`<script>const value = ${12}; if (value < 20) void 0;</script>`
        expect(script.toString()).toBe(
            '<script>const value = 12; if (value < 20) void 0;</script>'
        )
        // prettier-ignore
        const style = html`<style>.item { color: ${'red'}; }</style>`
        expect(style.toString()).toBe('<style>.item { color: red; }</style>')
        // prettier-ignore
        const output = html`<svg><style>${'</style><img data-injected>'}</style></svg>`.toString()
        expect(parse(output).querySelector('img')).toBeNull()
        expect(parse(output).querySelector('style')!.textContent).toBe(
            '</style><img data-injected>'
        )
    })

    it('rejects plaintext because it cannot be closed in a serialized fragment', () => {
        expect(() => html`<plaintext>text</plaintext>`.toString()).toThrow(
            'Cannot serialize <plaintext>'
        )
    })

    it.each([false, true])(
        'rejects processing instructions (nested: %s)',
        (nested) => {
            const instruction = document.createProcessingInstruction(
                'probe',
                '><img data-injected>'
            )
            const view = nested
                ? html`<div>${instruction}</div>`
                : html`${instruction}`
            expect(() => view.toString()).toThrow(
                'Cannot serialize processing instructions as HTML.'
            )
        }
    )

    it('disposes a temporary mount after serialization rejects unsafe content', () => {
        const [content, setContent] = state('</script><img data-injected>')
        const read = jest.fn(() => content())
        const cleanup = jest.fn()
        // prettier-ignore
        const view = html`<script type="application/json">${read}</script>`.onMount(() => cleanup)

        expect(() => view.toString()).toThrow('Cannot serialize unsafe content')
        expect(view.mounted).toBe(false)
        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(read).toHaveBeenCalledTimes(1)
        setContent('{"safe":true}')
        jest.runAllTicks()
        expect(read).toHaveBeenCalledTimes(1)
        expect(view.toString()).toBe(
            '<script type="application/json">{"safe":true}</script>'
        )
        expect(cleanup).toHaveBeenCalledTimes(2)
    })

    it('does not clone or reconnect mounted custom elements during serialization', () => {
        const construct = jest.fn()
        const connect = jest.fn()
        class SerializationProbe extends HTMLElement {
            constructor() {
                super()
                construct()
            }
            connectedCallback() {
                connect()
            }
        }
        customElements.define('serialization-probe', SerializationProbe)
        const view = html`<serialization-probe
            >${payload}</serialization-probe
        >`.render(document.body)
        const node = document.body.firstElementChild
        const constructionCount = construct.mock.calls.length
        const connectionCount = connect.mock.calls.length
        view.toString()

        expect(document.body.firstElementChild).toBe(node)
        expect(construct).toHaveBeenCalledTimes(constructionCount)
        expect(connect).toHaveBeenCalledTimes(connectionCount)
        view.unmount()
    })
})

describe('dynamic event binding validation', () => {
    it.each(['click', 'load', 'begin', 'custom'])(
        'rejects string handlers for on%s, including whitespace',
        (event) => {
            const view = new HtmlTemplate(
                [`<button on${event}=" \n`, '\t ">test</button>'],
                ['void 0']
            )
            expect(() => view.render(document.body)).toThrow(
                `Handler for event "on${event}" is not a function`
            )
            expect(document.body.querySelector(`[on${event}]`)).toBeNull()
        }
    )

    it.each([
        () => html`<button onclick="prefix ${'void 0'}">test</button>`,
        () => html`<button onclick="${'void 0'};">test</button>`,
        () => html`<button onclick="${'void'}${' 0'}">test</button>`,
        () => html`<svg><animate onbegin="prefix ${'void 0'}"></animate></svg>`,
    ])(
        'rejects mixed event strings before setting an inline attribute',
        (create) => {
            expect(() => create().render(document.body)).toThrow(
                'must contain a single interpolation'
            )
            expect(
                document.body.querySelector('[onclick], [onbegin]')
            ).toBeNull()
        }
    )

    it('does not evaluate a reactive string as an event handler', () => {
        const [code, setCode] = state('void 0')
        const read = jest.fn(() => code())
        expect(() =>
            html`<button onclick="prefix ${read}">test</button>`.render(
                document.body
            )
        ).toThrow('must contain a single interpolation')
        setCode('different string')
        jest.runAllTicks()
        expect(read).not.toHaveBeenCalled()
        expect(document.body.querySelector('[onclick]')).toBeNull()
    })

    it('accepts whitespace around function and listener-tuple bindings without inline attributes', () => {
        const click = jest.fn()
        const view = html`<button
            onclick=" 
${[click, { once: true }]}	 "
        >
            test
        </button>`.render(document.body)
        const button = document.body.querySelector('button')!
        expect(button.hasAttribute('onclick')).toBe(false)
        button.click()
        button.click()
        expect(click).toHaveBeenCalledTimes(1)
        view.unmount()
    })

    it('validates SVG event spreads even when the event is absent from document', () => {
        const listener = jest.fn()
        const view = html`<svg>
            <animate ${{ onbegin: listener }}></animate>
        </svg>`.render(document.body)
        const animation = document.body.querySelector('animate')!
        expect(animation.hasAttribute('onbegin')).toBe(false)
        animation.dispatchEvent(new Event('begin'))
        expect(listener).toHaveBeenCalledTimes(1)
        view.unmount()
        expect(() =>
            html`<svg>
                <animate ${{ onbegin: 'void 0' }}></animate>
            </svg>`.render(document.body)
        ).toThrow('Handler for event "onbegin" is not a function')
    })

    it('preserves observed non-native custom-element properties but validates native events', () => {
        class EventPropertyProbe extends HTMLElement {
            static observedAttributes = ['one', 'onclick']
            one = ''
        }
        customElements.define('event-property-probe', EventPropertyProbe)
        const view = html`<event-property-probe
            one="prefix ${'value'}"
        ></event-property-probe>`.render(document.body)
        expect(
            (document.body.firstElementChild as EventPropertyProbe).one
        ).toBe('prefix value')
        view.unmount()
        expect(() =>
            html`<event-property-probe
                onclick=" ${'void 0'}"
            ></event-property-probe>`.render(document.body)
        ).toThrow('Handler for event "onclick" is not a function')
        expect(() =>
            html`<event-property-probe
                onclick="prefix ${'void 0'}"
            ></event-property-probe>`.render(document.body)
        ).toThrow('must contain a single interpolation')
    })
})
