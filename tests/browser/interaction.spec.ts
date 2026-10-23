import { expect, test, type Page } from '@playwright/test'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

declare global {
    interface Window {
        Markup: typeof import('../../src/index.ts')
    }
}

let browserSource: string

test.beforeAll(async () => {
    const result = await build({
        entryPoints: [
            fileURLToPath(new URL('../../src/index.ts', import.meta.url)),
        ],
        bundle: true,
        format: 'iife',
        globalName: 'Markup',
        platform: 'browser',
        target: 'es2022',
        write: false,
        logLevel: 'silent',
    })
    browserSource = result.outputFiles[0].text
})

const loadMarkup = async (page: Page, fallback = false) => {
    await page.setContent('<!doctype html><html><body></body></html>')
    if (fallback) {
        await page.evaluate(() => {
            for (const prototype of [
                Element.prototype,
                Document.prototype,
                DocumentFragment.prototype,
            ]) {
                Object.defineProperty(prototype, 'moveBefore', {
                    configurable: true,
                    value: undefined,
                })
            }
        })
    }
    await page.addScriptTag({ content: browserSource })
}

test('inert=false restores native keyboard access to the subtree', async ({
    page,
}) => {
    await loadMarkup(page)
    await page.evaluate(() => {
        const { html, state } = window.Markup
        const [blocked, setBlocked] = state(true)
        html`<button id="before">Before</button>
            <main inert=${blocked}>
                <button id="inside">Continue</button>
            </main>
            <button id="after">After</button>
            <button id="enable" onclick=${() => setBlocked(false)}>
                Enable
            </button>`.render(document.body)
    })

    await expect(page.locator('main')).toHaveJSProperty('inert', true)
    await page.locator('#before').focus()
    await page.keyboard.press('Tab')
    await expect(page.locator('#after')).toBeFocused()

    await page.locator('#enable').click()
    await expect(page.locator('main')).not.toHaveAttribute('inert')
    await expect(page.locator('main')).toHaveJSProperty('inert', false)
    await page.locator('#before').focus()
    await page.keyboard.press('Tab')
    await expect(page.locator('#inside')).toBeFocused()
})

for (const mode of [
    'browser defaults',
    'fallback without moveBefore',
] as const) {
    test.describe(mode, () => {
        test.beforeEach(async ({ page }) => {
            await loadMarkup(page, mode === 'fallback without moveBefore')
            if (mode === 'fallback without moveBefore') {
                expect(
                    await page.evaluate(
                        () =>
                            typeof (
                                Element.prototype as Element & {
                                    moveBefore?: unknown
                                }
                            ).moveBefore
                    )
                ).toBe('undefined')
            }
        })

        for (const fragment of [false, true]) {
            test(`reversing ${fragment ? 'fragment' : 'single-root'} rows preserves input identity, focus, and selection`, async ({
                page,
            }) => {
                const result = await page.evaluate(async (fragment) => {
                    const { html, repeat, state } = window.Markup
                    const initial = ['a', 'b', 'c'].map((id) => ({ id }))
                    const [items, setItems] = state(initial)
                    html`${repeat(
                        items,
                        (item) =>
                            fragment
                                ? html`<label>${item.id}</label>
                                      <input
                                          data-id=${item.id}
                                          value=${item.id}
                                      />`
                                : html`<label>
                                      ${item.id}
                                      <input
                                          data-id=${item.id}
                                          value=${item.id}
                                      />
                                  </label>`,
                        { key: (item) => item.id }
                    )}`.render(document.body)
                    const originals = new Map(
                        Array.from(document.querySelectorAll('input')).map(
                            (input) => [input.dataset.id, input]
                        )
                    )
                    const input = originals.get('c')!
                    input.value = 'unsaved editing'
                    input.focus()
                    input.setSelectionRange(2, 8, 'backward')
                    setItems([...initial].reverse())
                    await Promise.resolve()

                    const inputs = Array.from(
                        document.querySelectorAll('input')
                    )
                    return {
                        order: inputs.map((input) => input.dataset.id),
                        retained: inputs.every(
                            (input) => originals.get(input.dataset.id) === input
                        ),
                        focused: document.activeElement === input,
                        value: input.value,
                        selection: [
                            input.selectionStart,
                            input.selectionEnd,
                            input.selectionDirection,
                        ],
                    }
                }, fragment)

                expect(result).toEqual({
                    order: ['c', 'b', 'a'],
                    retained: true,
                    focused: true,
                    value: 'unsaved editing',
                    selection: [2, 8, 'backward'],
                })
            })
        }

        test('reversing rows preserves a contenteditable backward selection', async ({
            page,
        }) => {
            const result = await page.evaluate(async () => {
                const { html, repeat, state } = window.Markup
                const initial = ['a', 'b', 'c'].map((id) => ({ id }))
                const [items, setItems] = state(initial)
                html`${repeat(
                    items,
                    (item) =>
                        html`<div contenteditable="true" data-id=${item.id}>
                            editable text
                        </div>`,
                    { key: (item) => item.id }
                )}`.render(document.body)
                const editor =
                    document.querySelector<HTMLElement>('[data-id="c"]')!
                editor.textContent = 'editable text'
                const text = editor.firstChild!
                editor.focus()
                document.getSelection()!.setBaseAndExtent(text, 8, text, 2)
                const initialSelection = document.getSelection()!.toString()
                setItems([...initial].reverse())
                await Promise.resolve()
                const selection = document.getSelection()!

                return {
                    initialSelection,
                    retained:
                        document.querySelector('[data-id="c"]') === editor,
                    focused: document.activeElement === editor,
                    anchorRetained: selection.anchorNode === text,
                    focusRetained: selection.focusNode === text,
                    offsets: [selection.anchorOffset, selection.focusOffset],
                    text: selection.toString(),
                }
            })

            expect(result).toEqual({
                initialSelection: 'itable',
                retained: true,
                focused: true,
                anchorRetained: true,
                focusRetained: true,
                offsets: [8, 2],
                text: 'itable',
            })
        })

        test('reversing rows preserves focus and input selection inside open shadow DOM', async ({
            page,
        }) => {
            const result = await page.evaluate(async () => {
                const { html, repeat, state } = window.Markup
                customElements.define(
                    'shadow-input-row',
                    class extends HTMLElement {
                        constructor() {
                            super()
                            this.attachShadow({ mode: 'open' }).innerHTML =
                                '<input value="shadow editing">'
                        }
                    }
                )
                const initial = ['a', 'b', 'c'].map((id) => ({ id }))
                const [items, setItems] = state(initial)
                html`${repeat(
                    items,
                    (item) =>
                        html`<shadow-input-row
                            data-id=${item.id}
                        ></shadow-input-row>`,
                    { key: (item) => item.id }
                )}`.render(document.body)
                const host = document.querySelector('[data-id="c"]')!
                const input = host.shadowRoot!.querySelector('input')!
                input.focus()
                input.setSelectionRange(1, 6, 'backward')
                setItems([...initial].reverse())
                await Promise.resolve()

                return {
                    retained: document.querySelector('[data-id="c"]') === host,
                    hostFocused: document.activeElement === host,
                    inputFocused: host.shadowRoot!.activeElement === input,
                    selection: [
                        input.selectionStart,
                        input.selectionEnd,
                        input.selectionDirection,
                    ],
                }
            })

            expect(result).toEqual({
                retained: true,
                hostFocused: true,
                inputFocused: true,
                selection: [1, 6, 'backward'],
            })
        })

        test('reversing rows preserves contenteditable selection inside open shadow DOM', async ({
            page,
        }) => {
            // Some engines re-scope document Selection endpoints to the host
            // and do not expose ShadowRoot.getSelection(). Only this shadow
            // text-selection case needs those endpoints; ordinary editors and
            // open-shadow input focus/selection remain unconditional tests.
            const exposesShadowSelection = await page.evaluate(() => {
                const host = document.createElement('div')
                const shadow = host.attachShadow({
                    mode: 'open',
                }) as ShadowRoot & { getSelection?: () => Selection | null }
                shadow.innerHTML =
                    '<div contenteditable="true">shadow selection probe</div>'
                document.body.append(host)
                const editor = shadow.querySelector<HTMLElement>('div')!
                const text = editor.firstChild!
                editor.focus()
                const selection =
                    shadow.getSelection?.() ?? document.getSelection()
                selection?.setBaseAndExtent(text, 6, text, 1)
                const exposed =
                    selection?.anchorNode === text &&
                    selection.focusNode === text &&
                    selection.anchorOffset === 6 &&
                    selection.focusOffset === 1
                selection?.removeAllRanges()
                host.remove()
                return exposed
            })
            test.skip(
                !exposesShadowSelection,
                'This engine does not expose open-shadow text-selection endpoints through Selection or ShadowRoot.getSelection()'
            )
            const result = await page.evaluate(async () => {
                const { html, repeat, state } = window.Markup
                customElements.define(
                    'shadow-editor-row',
                    class extends HTMLElement {
                        constructor() {
                            super()
                            this.attachShadow({ mode: 'open' }).innerHTML =
                                '<div contenteditable="true">shadow editing</div>'
                        }
                    }
                )
                const initial = ['a', 'b', 'c'].map((id) => ({ id }))
                const [items, setItems] = state(initial)
                html`${repeat(
                    items,
                    (item) =>
                        html`<shadow-editor-row
                            data-id=${item.id}
                        ></shadow-editor-row>`,
                    { key: (item) => item.id }
                )}`.render(document.body)
                const host = document.querySelector('[data-id="c"]')!
                const shadow = host.shadowRoot! as ShadowRoot & {
                    getSelection?: () => Selection | null
                }
                const editor = shadow.querySelector<HTMLElement>('div')!
                const text = editor.firstChild!
                const getSelection = () =>
                    shadow.getSelection?.() ?? document.getSelection()!
                editor.focus()
                getSelection()!.setBaseAndExtent(text, 6, text, 1)
                const initialSelection = getSelection()!.toString()
                setItems([...initial].reverse())
                await Promise.resolve()
                const selection = getSelection()!

                return {
                    initialSelection,
                    retained: document.querySelector('[data-id="c"]') === host,
                    focused: shadow.activeElement === editor,
                    anchorRetained: selection.anchorNode === text,
                    focusRetained: selection.focusNode === text,
                    offsets: [selection.anchorOffset, selection.focusOffset],
                    text: selection.toString(),
                }
            })

            expect(result).toEqual({
                initialSelection: 'hadow',
                retained: true,
                focused: true,
                anchorRetained: true,
                focusRetained: true,
                offsets: [6, 1],
                text: 'hadow',
            })
        })

        test('immutable keyed updates preserve composed rows and their mount lifetime', async ({
            page,
        }) => {
            const result = await page.evaluate(async () => {
                const { html, repeat, state } = window.Markup
                const initial = ['a', 'b', 'c'].map((id) => ({ id, label: id }))
                const [items, setItems] = state(initial)
                const [suffix, setSuffix] = state('!')
                let mounts = 0
                let clicked = ''
                const cleanups: string[] = []
                const view = html`${repeat(
                    items,
                    (item) =>
                        html`<article data-id=${item.id}>
                            <input />
                            <span>${() => item.label + suffix()}</span>
                            ${html`<strong>${item.label}</strong>`}
                            <button onclick=${() => (clicked = item.label)}>
                                Use
                            </button>
                        </article>`.onMount(() => {
                            mounts += 1
                            return () => cleanups.push(item.label)
                        }),
                    { key: (item) => item.id }
                )}`
                view.render(document.body)
                const originals = new Map(
                    Array.from(document.querySelectorAll('article')).map(
                        (row) => [row.dataset.id, row]
                    )
                )
                const row = originals.get('c')!
                const nested = row.querySelector('strong')!
                const input = row.querySelector('input')!
                input.value = 'local editing'
                input.focus()
                input.setSelectionRange(1, 7, 'backward')
                setItems(
                    initial.map((item) => ({
                        ...item,
                        label: item.label.toUpperCase(),
                    }))
                )
                await Promise.resolve()
                setSuffix('?')
                await Promise.resolve()
                row.querySelector('button')!.click()
                const beforeUnmount = {
                    retained: Array.from(
                        document.querySelectorAll('article')
                    ).every((row) => originals.get(row.dataset.id) === row),
                    nestedRetained: row.querySelector('strong') === nested,
                    text: row.querySelector('span')!.textContent,
                    nestedText: nested.textContent,
                    clicked,
                    focused: document.activeElement === input,
                    value: input.value,
                    selection: [
                        input.selectionStart,
                        input.selectionEnd,
                        input.selectionDirection,
                    ],
                    mounts,
                    cleanups: cleanups.length,
                }
                view.unmount()
                return { ...beforeUnmount, disposed: cleanups.sort() }
            })

            expect(result).toEqual({
                retained: true,
                nestedRetained: true,
                text: 'C?',
                nestedText: 'C',
                clicked: 'C',
                focused: true,
                value: 'local editing',
                selection: [1, 7, 'backward'],
                mounts: 3,
                cleanups: 0,
                disposed: ['a', 'b', 'c'],
            })
        })

        test('stable-object reorder, prepend, and removal refresh positional ARIA metadata', async ({
            page,
        }) => {
            const result = await page.evaluate(async () => {
                const { html, repeat, state } = window.Markup
                const initial = ['a', 'b', 'c'].map((id) => ({ id }))
                const [items, setItems] = state(initial)
                html`<ol>
                    ${repeat(
                        items,
                        (item, index) =>
                            html`<li
                                data-id=${item.id}
                                aria-posinset=${index + 1}
                            >
                                ${item.id}: ${index + 1}
                            </li>`,
                        { key: (item) => item.id }
                    )}
                </ol>`.render(document.body)
                const snapshot = () =>
                    Array.from(document.querySelectorAll('li')).map((row) => ({
                        id: row.dataset.id,
                        position: row.getAttribute('aria-posinset'),
                        label: row.textContent?.trim(),
                    }))
                setItems([...initial].reverse())
                await Promise.resolve()
                const reversed = snapshot()
                setItems([
                    { id: 'x' },
                    ...items().filter((item) => item.id !== 'b'),
                ])
                await Promise.resolve()
                return { reversed, changed: snapshot() }
            })

            expect(result).toEqual({
                reversed: [
                    { id: 'c', position: '1', label: 'c: 1' },
                    { id: 'b', position: '2', label: 'b: 2' },
                    { id: 'a', position: '3', label: 'a: 3' },
                ],
                changed: [
                    { id: 'x', position: '1', label: 'x: 1' },
                    { id: 'c', position: '2', label: 'c: 2' },
                    { id: 'a', position: '3', label: 'a: 3' },
                ],
            })
        })
    })
}

test('native moveBefore uses custom-element move callbacks without reconnecting retained rows', async ({
    page,
}) => {
    await loadMarkup(page)
    const supported = await page.evaluate(
        () =>
            typeof (Element.prototype as Element & { moveBefore?: unknown })
                .moveBefore === 'function'
    )
    test.skip(
        !supported,
        'This browser does not implement state-preserving moves'
    )
    const result = await page.evaluate(async () => {
        const { html, repeat, state } = window.Markup
        let connections = 0
        let disconnections = 0
        let moves = 0
        customElements.define(
            'moving-row',
            class extends HTMLElement {
                connectedCallback() {
                    connections += 1
                }
                disconnectedCallback() {
                    disconnections += 1
                }
                connectedMoveCallback() {
                    moves += 1
                }
            }
        )
        const initial = ['a', 'b', 'c'].map((id) => ({ id }))
        const [items, setItems] = state(initial)
        html`${repeat(
            items,
            (item) =>
                html`<moving-row data-id=${item.id}>${item.id}</moving-row>`,
            { key: (item) => item.id }
        )}`.render(document.body)
        const before = connections
        const original = document.querySelector('[data-id="c"]')
        setItems([...initial].reverse())
        await Promise.resolve()
        return {
            before,
            connections,
            disconnections,
            moves,
            retained: document.querySelector('[data-id="c"]') === original,
            order: Array.from(document.querySelectorAll('moving-row')).map(
                (row) => row.getAttribute('data-id')
            ),
        }
    })

    expect(result.before).toBe(3)
    expect(result.connections).toBe(result.before)
    expect(result.disconnections).toBe(0)
    expect(result.moves).toBeGreaterThan(0)
    expect(result.retained).toBe(true)
    expect(result.order).toEqual(['c', 'b', 'a'])
})

test('native moves preserve input focus and selection inside a closed shadow root', async ({
    page,
}) => {
    await loadMarkup(page)
    const supported = await page.evaluate(
        () =>
            typeof (Element.prototype as Element & { moveBefore?: unknown })
                .moveBefore === 'function'
    )
    test.skip(!supported, 'Closed shadow state requires state-preserving moves')
    const result = await page.evaluate(async () => {
        const { html, repeat, state } = window.Markup
        const internals = new WeakMap<
            Element,
            { root: ShadowRoot; input: HTMLInputElement }
        >()
        customElements.define(
            'closed-input-row',
            class extends HTMLElement {
                constructor() {
                    super()
                    const root = this.attachShadow({ mode: 'closed' })
                    root.innerHTML = '<input value="closed editing">'
                    internals.set(this, {
                        root,
                        input: root.querySelector('input')!,
                    })
                }
            }
        )
        const initial = ['a', 'b', 'c'].map((id) => ({ id }))
        const [items, setItems] = state(initial)
        html`${repeat(
            items,
            (item) =>
                html`<closed-input-row data-id=${item.id}></closed-input-row>`,
            { key: (item) => item.id }
        )}`.render(document.body)
        const host = document.querySelector('[data-id="c"]')!
        const { root, input } = internals.get(host)!
        input.focus()
        input.setSelectionRange(2, 7, 'backward')
        setItems([...initial].reverse())
        await Promise.resolve()

        return {
            retained: document.querySelector('[data-id="c"]') === host,
            closed: host.shadowRoot === null,
            hostFocused: document.activeElement === host,
            inputFocused: root.activeElement === input,
            selection: [
                input.selectionStart,
                input.selectionEnd,
                input.selectionDirection,
            ],
        }
    })

    expect(result).toEqual({
        retained: true,
        closed: true,
        hostFocused: true,
        inputFocused: true,
        selection: [2, 7, 'backward'],
    })
})
