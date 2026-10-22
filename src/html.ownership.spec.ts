import '../test.common.ts'
import { html, HtmlTemplate } from './html.ts'
import { state } from './state.ts'
import { repeat } from './helpers/repeat.helper.ts'

describe('template disposal', () => {
    it.each([
        ['static', () => html`<span>static</span>`],
        ['simple child', () => html`${'text'}`],
        ['dynamic', () => html`<span>${() => 'dynamic'}</span>`],
    ] as const)('clears cleanup between %s mounts', (_name, create) => {
        const cleanup = jest.fn()
        let mounts = 0
        const template = create().onMount(() => {
            mounts++
            return mounts === 1 ? cleanup : undefined
        })

        template.render(document.body).unmount()
        template.render(document.body).unmount()
        template.unmount()

        expect(mounts).toBe(2)
        expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it('finishes the whole tree before reporting cleanup failures', () => {
        const childError = new Error('child cleanup failed')
        const parentError = new Error('parent cleanup failed')
        const [value, setValue] = state(0)
        const renderValue = jest.fn(() => value())
        const firstCleanup = jest.fn(() => {
            throw childError
        })
        const secondCleanup = jest.fn()
        const parentCleanup = jest.fn(() => {
            throw parentError
        })
        const first = html`<span>first</span>`.onMount(() => firstCleanup)
        const second = html`<span ref="value">${renderValue}</span>`.onMount(
            () => secondCleanup
        )
        const parent = html`<section>${[first, second]}</section>`.onMount(
            () => parentCleanup
        )
        parent.render(document.body)

        let failure: unknown
        try {
            parent.unmount()
        } catch (error) {
            failure = error
        }

        expect(failure).toBeInstanceOf(AggregateError)
        expect((failure as AggregateError).errors).toEqual([
            childError,
            parentError,
        ])
        expect(document.body.innerHTML).toBe('')
        expect([parent.mounted, first.mounted, second.mounted]).toEqual([
            false,
            false,
            false,
        ])
        expect(parent.refs).toEqual({})
        expect(parent.__CHILDREN__.size).toBe(0)
        expect(first.__PARENT__).toBeNull()
        expect(second.__PARENT__).toBeNull()
        expect(firstCleanup).toHaveBeenCalledTimes(1)
        expect(secondCleanup).toHaveBeenCalledTimes(1)
        expect(parentCleanup).toHaveBeenCalledTimes(1)

        const readsAfterDisposal = renderValue.mock.calls.length
        setValue(9)
        jest.runOnlyPendingTimers()
        expect(renderValue).toHaveBeenCalledTimes(readsAfterDisposal)
        expect(() => parent.unmount()).not.toThrow()

        parent.render(document.body)
        expect(document.body.textContent).toBe('first9')
        expect(() => parent.unmount()).toThrow(AggregateError)
        expect(secondCleanup).toHaveBeenCalledTimes(2)
        expect(document.body.innerHTML).toBe('')
    })

    it('cannot run the same cleanup twice through reentrant unmount', () => {
        let parent: HtmlTemplate
        const cleanup = jest.fn(() => parent.unmount())
        const child = html`<span>child</span>`.onMount(() => cleanup)
        parent = html`<main>${child}</main>`
        parent.render(document.body)

        parent.unmount()

        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(parent.mounted).toBe(false)
        expect(child.mounted).toBe(false)
        expect(document.body.innerHTML).toBe('')
    })

    it('does not remount a parent partway through its child teardown', () => {
        let parent: HtmlTemplate
        const mount = jest.fn()
        const child = html`<span>child</span>`.onMount(
            () => () => parent.render(document.body)
        )
        parent = html`<main>${child}</main>`.onMount(mount)
        parent.render(document.body).unmount()

        expect(mount).toHaveBeenCalledTimes(1)
        expect(parent.mounted).toBe(false)
        expect(child.mounted).toBe(false)
        expect(document.body.innerHTML).toBe('')
    })

    it('immediately releases cleanup returned by a mount that unmounted itself', () => {
        const cleanup = jest.fn()
        let mounts = 0
        const template = html`<span>child</span>`.onMount((mounted) => {
            mounts++
            if (mounts === 1) {
                mounted.unmount()
                return cleanup
            }
        })

        template.render(document.body)
        expect(template.mounted).toBe(false)
        expect(cleanup).toHaveBeenCalledTimes(1)
        template.render(document.body).unmount()
        expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it('finishes replacing a child before surfacing its cleanup error', () => {
        const error = new Error('replacement cleanup failed')
        const previous = html`<i>previous</i>`.onMount(() => () => {
            throw error
        })
        const parent = html`<section>${previous}</section>`.render(
            document.body
        )
        const replacement = html`<b>replacement</b>`

        expect(() => replacement.replace(previous)).toThrow(error)
        expect(previous.mounted).toBe(false)
        expect(replacement.mounted).toBe(true)
        expect(replacement.__PARENT__).toBe(parent)
        expect(parent.__CHILDREN__.has(previous)).toBe(false)
        expect(document.body.innerHTML).toBe(
            '<section><b>replacement</b></section>'
        )
        parent.unmount()
        expect(replacement.mounted).toBe(false)
    })

    it('clears every child in a removed range despite throwing cleanup', () => {
        const error = new Error('range cleanup failed')
        const cleanup = jest.fn()
        const first = html`<i>first</i>`.onMount(() => () => {
            throw error
        })
        const second = html`<b>second</b>`.onMount(() => cleanup)
        const [items, setItems] = state([first, second])
        const parent = html`<main>${items}</main>`.render(document.body)
        const report = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            setItems([])
            jest.runOnlyPendingTimers()

            expect(first.mounted).toBe(false)
            expect(second.mounted).toBe(false)
            expect(cleanup).toHaveBeenCalledTimes(1)
            expect(parent.__CHILDREN__.size).toBe(0)
            expect(document.body.innerHTML).toBe('<main></main>')
            expect(report).toHaveBeenCalled()

            setItems([second])
            jest.runOnlyPendingTimers()
            expect(document.body.textContent).toBe('second')
            parent.unmount()
            expect(cleanup).toHaveBeenCalledTimes(2)
        } finally {
            report.mockRestore()
        }
    })

    it('finishes reused row parts and removed siblings before reporting cleanup errors', () => {
        const firstError = new Error('first nested cleanup failed')
        const secondError = new Error('second nested cleanup failed')
        const first = html`<i>old A</i>`.onMount(() => () => {
            throw firstError
        })
        const second = html`<i>old B</i>`.onMount(() => () => {
            throw secondError
        })
        const removedCleanup = jest.fn()
        let removedRow: HtmlTemplate | undefined
        const [items, setItems] = state([
            { id: 1, first, second },
            {
                id: 2,
                first: html`<i>removed A</i>`,
                second: html`<i>removed B</i>`,
            },
        ])
        const view = html`${repeat(
            items,
            (item) =>
                html`<section data-id="${item.id}">
                    ${item.first}${item.second}
                </section>`.onMount((row) => {
                    if (item.id === 2) {
                        removedRow = row
                        return removedCleanup
                    }
                }),
            { key: (item) => item.id }
        )}`.render(document.body)
        const retainedNode = document.querySelector('section')
        const report = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            setItems([
                {
                    id: 1,
                    first: html`<b>new A</b>`,
                    second: html`<b>new B</b>`,
                },
            ])
            jest.runOnlyPendingTimers()

            expect(document.querySelector('section')).toBe(retainedNode)
            expect([...document.body.children]).toEqual([retainedNode])
            expect(
                [...retainedNode!.children].map((node) => node.outerHTML)
            ).toEqual(['<b>new A</b>', '<b>new B</b>'])
            expect(first.mounted).toBe(false)
            expect(second.mounted).toBe(false)
            expect(removedRow?.mounted).toBe(false)
            expect(removedCleanup).toHaveBeenCalledTimes(1)
            expect(report).toHaveBeenCalledTimes(1)
            expect(report.mock.calls[0][0]).toBeInstanceOf(AggregateError)
            expect(report.mock.calls[0][0].errors).toEqual([
                firstError,
                secondError,
            ])
            view.unmount()
            expect(document.body.innerHTML).toBe('')
        } finally {
            report.mockRestore()
        }
    })

    it('keeps explicit unmount errors synchronous inside a render callback', () => {
        const error = new Error('explicit cleanup failed')
        const child = html`<i>child</i>`
            .onMount(() => () => {
                throw error
            })
            .render(document.body)
        const [remove, setRemove] = state(false)
        let caught: unknown
        const view = html`<p>
            ${() => {
                if (remove()) {
                    try {
                        child.unmount()
                    } catch (failure) {
                        caught = failure
                    }
                }
                return 'parent'
            }}
        </p>`.render(document.body)

        setRemove(true)
        jest.runOnlyPendingTimers()
        expect(caught).toBe(error)
        expect(child.mounted).toBe(false)
        expect(document.body.children).toHaveLength(1)
        expect(document.querySelector('p')?.textContent?.trim()).toBe('parent')
        view.unmount()
    })

    it('still throws invalid handler errors during a direct rebind', () => {
        const make = (handler: unknown) =>
            html`<button onclick="${handler}">button</button>`
        const view = make(() => {}).render(document.body)

        expect(() => view.__rebind__(make('invalid handler'))).toThrow(
            'Handler for event "onclick" is not a function.'
        )
        expect(
            document.querySelector('button')?.getAttribute('onclick')
        ).toBeNull()
        view.unmount()
    })
})

describe('template ownership transfer', () => {
    it('preserves ownership when replacing an unattached template is a no-op', () => {
        const cleanup = jest.fn()
        const child = html`<span>child</span>`.onMount(() => cleanup)
        const parent = html`<section>${child}</section>`.render(document.body)

        child.replace(html`<i>unmounted</i>`)

        expect(child.__PARENT__).toBe(parent)
        expect(parent.__CHILDREN__.has(child)).toBe(true)
        expect(document.body.innerHTML).toBe(
            '<section><span>child</span></section>'
        )
        parent.unmount()
        expect(child.mounted).toBe(false)
        expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it.each(['replace', 'insertAfter'] as const)(
        'releases ownership when %s moves outside the old root boundary',
        (action) => {
            const cleanup = jest.fn()
            const child = html`<span>child</span>`.onMount(() => cleanup)
            const parent = html`<section>${child}</section>`.render(
                document.body
            )

            child[action](parent.childNodes[0])

            expect(child.__PARENT__).toBeNull()
            expect(parent.__CHILDREN__.has(child)).toBe(false)
            parent.unmount()
            expect(child.mounted).toBe(true)
            expect(document.body.innerHTML).toBe('<span>child</span>')
            expect(cleanup).not.toHaveBeenCalled()
            child.unmount()
            expect(cleanup).toHaveBeenCalledTimes(1)
        }
    )

    it.each(['replace', 'insertAfter'] as const)(
        'keeps ownership when %s moves within a fragment range',
        (action) => {
            const cleanup = jest.fn()
            const child = html`<span>child</span>`.onMount(() => cleanup)
            const parent = html`<i>before</i>${child}<i>after</i>`.render(
                document.body
            )

            child[action](parent.childNodes.at(-1)!)

            expect(child.__PARENT__).toBe(parent)
            expect(parent.__CHILDREN__.has(child)).toBe(true)
            parent.unmount()
            expect(child.mounted).toBe(false)
            expect(document.body.innerHTML).toBe('')
            expect(cleanup).toHaveBeenCalledTimes(1)
        }
    )

    it.each(['old first', 'new first'] as const)(
        'keeps ownership exclusive when disposing %s',
        (order) => {
            const [value, setValue] = state(0)
            const cleanup = jest.fn()
            const child = html`<span ref="child">${value}</span>`.onMount(
                () => cleanup
            )
            const oldParent = html`<section>${child}</section>`.render(
                document.body
            )
            const newParent = html`<article>${child}</article>`.render(
                document.body
            )

            expect(oldParent.__CHILDREN__.has(child)).toBe(false)
            expect(oldParent.refs.child).toBeUndefined()
            expect(newParent.__CHILDREN__.has(child)).toBe(true)
            expect(child.__PARENT__).toBe(newParent)

            if (order === 'old first') {
                oldParent.unmount()
                expect(child.mounted).toBe(true)
                setValue(9)
                jest.runOnlyPendingTimers()
                expect(document.body.innerHTML).toBe(
                    '<article><span>9</span></article>'
                )
                newParent.unmount()
            } else {
                newParent.unmount()
                oldParent.unmount()
            }

            expect(cleanup).toHaveBeenCalledTimes(1)
            expect(document.body.innerHTML).toBe('')
        }
    )

    it('does not let stale arrays reclaim a transferred child', () => {
        const [value, setValue] = state(0)
        const cleanup = jest.fn()
        const child = html`<b>${value}</b>`.onMount(() => cleanup)
        const left = html`<i>left</i>`
        const right = html`<i>right</i>`
        const [items, setItems] = state([left, child, right])
        const oldParent = html`<section>${items}</section>`.render(
            document.body
        )
        const newParent = html`<article>${child}</article>`.render(
            document.body
        )

        setItems([right, child, left])
        jest.runOnlyPendingTimers()
        expect(document.querySelector('section')?.textContent).toBe('rightleft')
        expect(document.querySelector('article')?.textContent).toBe('0')
        expect(child.__PARENT__).toBe(newParent)

        setItems([])
        jest.runOnlyPendingTimers()
        setValue(7)
        jest.runOnlyPendingTimers()
        expect(document.querySelector('article')?.textContent).toBe('7')
        expect(cleanup).not.toHaveBeenCalled()

        // Removing the value and explicitly adding it again transfers it back.
        setItems([child])
        jest.runOnlyPendingTimers()
        expect(child.__PARENT__).toBe(oldParent)
        expect(document.querySelector('section')?.textContent).toBe('7')
        expect(document.querySelector('article')?.textContent).toBe('')
        newParent.unmount()
        expect(child.mounted).toBe(true)
        oldParent.unmount()
        expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it('does not dispose a sibling transferred by an earlier cleanup', () => {
        const secondCleanup = jest.fn()
        const second = html`<b>second</b>`.onMount(() => secondCleanup)
        const destination = document.createElement('article')
        document.body.append(destination)
        const first = html`<i>first</i>`.onMount(() => () => {
            second.render(destination)
            throw new Error('first cleanup failed')
        })
        const parent = html`<section>${[first, second]}</section>`.render(
            document.body
        )

        expect(() => parent.unmount()).toThrow('first cleanup failed')
        expect(second.mounted).toBe(true)
        expect(second.__PARENT__).toBeNull()
        expect(destination.textContent).toBe('second')
        expect(secondCleanup).not.toHaveBeenCalled()
        second.unmount()
        expect(secondCleanup).toHaveBeenCalledTimes(1)
    })

    it.each(['render', 'insertAfter', 'replace'] as const)(
        'detaches old ownership when %s moves a child to an external target',
        (action) => {
            const [value, setValue] = state(0)
            const child = html`<span>${value}</span>`
            const oldParent = html`<section>${child}</section>`.render(
                document.body
            )
            const host = document.createElement('article')
            const target = document.createElement('i')
            host.append(target)
            document.body.append(host)

            if (action === 'render') child.render(host)
            else child[action](target)
            oldParent.unmount()
            setValue(4)
            jest.runOnlyPendingTimers()

            expect(child.mounted).toBe(true)
            expect(child.__PARENT__).toBeNull()
            expect(host.querySelector('span')?.textContent).toBe('4')
            child.unmount()
        }
    )
})
