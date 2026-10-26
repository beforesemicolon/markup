import assert from 'node:assert/strict'
import { Bench, type BenchOptions } from 'tinybench'
import { html, repeat, state, type HtmlTemplate } from '../../src/index.ts'
import {
    generateItems,
    renderModerate,
    renderFilesystemLike,
    type StableItem,
} from './fixtures.ts'
import {
    assertRows,
    assertUpdate,
    expectedRenderCalls,
    flushRenderQueue,
    getRows,
    prepareUpdate,
    type BenchmarkSuite,
    type UpdateOperation,
} from './scenarios.ts'

export function createRepeatDomSuite(
    size: number,
    options: BenchOptions = {}
): BenchmarkSuite {
    const bench = new Bench({
        time: 100,
        ...options,
        retainSamples: true,
        throws: true,
    })
    const verifiedIterations = new Map<string, number>()
    const items = generateItems(size)
    const activeTemplates = new Set<HtmlTemplate>()
    const verified = (name: string) =>
        verifiedIterations.set(name, verifiedIterations.get(name)! + 1)
    const renderers = [
        {
            name: 'Minimal',
            render: (item: StableItem) => html`<span>${item.name}</span>`,
        },
        { name: 'Moderate', render: renderModerate },
        { name: 'FS-like', render: renderFilesystemLike },
    ]

    for (const { name, render } of renderers) {
        const taskName = `Initial Mount (${name}) - Size ${size}`
        let container: HTMLDivElement
        let template: HtmlTemplate | undefined
        let renderCalls = 0
        verifiedIterations.set(taskName, 0)
        bench.add(taskName, () => template?.render(container), {
            beforeEach() {
                container = document.createElement('div')
                template = html`<div>
                    ${repeat(items, (item) => {
                        renderCalls++
                        return render(item)
                    })}
                </div>`
                activeTemplates.add(template)
                renderCalls = 0
            },
            afterEach() {
                try {
                    assert.equal(renderCalls, size)
                    if (name === 'Minimal') {
                        assert.deepEqual(
                            Array.from(
                                container.querySelectorAll('span'),
                                (node) => node.textContent
                            ),
                            items.map((item) => item.name)
                        )
                    } else {
                        assertRows(container, items)
                    }
                    verified(taskName)
                } finally {
                    template!.unmount()
                    activeTemplates.delete(template!)
                    template = undefined
                    assert.equal(container.childNodes.length, 0)
                }
            },
        })
    }

    const updates: Array<{
        name: string
        operation: UpdateOperation
        keyed?: boolean
    }> = [
        { name: 'No-op update (Same Array)', operation: 'same-array' },
        { name: 'Update (New Array, Same Refs)', operation: 'new-array' },
        { name: 'Update (New Refs, Same IDs)', operation: 'immutable' },
        {
            name: 'Update (New Refs, Same IDs, Keyed)',
            operation: 'immutable',
            keyed: true,
        },
        { name: 'Update (Append 1)', operation: 'append' },
        { name: 'Update (Prepend 1)', operation: 'prepend' },
        { name: 'Update (Remove 1, Middle)', operation: 'remove' },
    ]

    for (const { name, operation, keyed } of updates) {
        const taskName = `${name} - FS-like - Size ${size}`
        let container: HTMLDivElement
        let template: HtmlTemplate | undefined
        let setItems: (items: StableItem[]) => unknown
        let next: StableItem[]
        let previousRows: Map<number, Element>
        let renderCalls = 0
        verifiedIterations.set(taskName, 0)
        bench.add(
            taskName,
            async () => {
                setItems(next)
                await flushRenderQueue()
            },
            {
                async beforeEach() {
                    if (!template) {
                        container = document.createElement('div')
                        const [getItems, updateItems] = state(items)
                        setItems = updateItems
                        template = html`<div>
                            ${repeat(
                                getItems,
                                (item) => {
                                    renderCalls++
                                    return renderFilesystemLike(item)
                                },
                                { key: keyed ? (item) => item.id : undefined }
                            )}
                        </div>`
                        activeTemplates.add(template)
                        template.render(container)
                    } else {
                        setItems(items)
                        await flushRenderQueue()
                    }
                    // The baseline must be fully committed before timing.
                    assertRows(container, items)
                    previousRows = getRows(container)
                    next = prepareUpdate(items, operation)
                    renderCalls = 0
                },
                afterEach() {
                    assertUpdate(items, next, operation)
                    assertRows(container, next, previousRows)
                    assert.equal(
                        renderCalls,
                        expectedRenderCalls(size, operation),
                        `${taskName}: renderer work drifted`
                    )
                    verified(taskName)
                },
                afterAll() {
                    template?.unmount()
                    if (template) activeTemplates.delete(template)
                    template = undefined
                    assert.equal(container.childNodes.length, 0)
                },
            }
        )
    }

    return {
        bench,
        verifiedIterations,
        dispose() {
            for (const template of activeTemplates) template.unmount()
            activeTemplates.clear()
        },
    }
}
