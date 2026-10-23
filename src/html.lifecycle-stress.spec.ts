import '../test.common.ts'
import { html, HtmlTemplate } from './html.ts'
import { repeat } from './helpers/repeat.helper.ts'
import { visible } from './helpers/visible.helper.ts'
import { state } from './state.ts'

describe('composed template lifecycle transitions', () => {
    it('repeatedly rebinds, transfers, releases and disposes each mount exactly once', () => {
        const originalObserver = Object.getOwnPropertyDescriptor(
            globalThis,
            'IntersectionObserver'
        )
        const observers: MockObserver[] = []
        class MockObserver implements IntersectionObserver {
            readonly root = null
            readonly rootMargin = '73px'
            readonly thresholds = [0]
            readonly targets = new Set<Element>()
            observe = jest.fn((target: Element) => this.targets.add(target))
            unobserve = jest.fn((target: Element) => this.targets.delete(target))
            disconnect = jest.fn(() => this.targets.clear())
            takeRecords = jest.fn(() => [])

            constructor(private callback: IntersectionObserverCallback) {
                observers.push(this)
            }

            emit(target: Element) {
                const rect = target.getBoundingClientRect()
                this.callback([
                    {
                        target,
                        isIntersecting: true,
                        intersectionRatio: 1,
                        boundingClientRect: rect,
                        intersectionRect: rect,
                        rootBounds: null,
                        time: performance.now(),
                    },
                ], this)
            }
        }
        Object.defineProperty(globalThis, 'IntersectionObserver', {
            configurable: true,
            writable: true,
            value: MockObserver,
        })

        const cleanupError = new Error('expected stress cleanup failure')
        const lifetimes: { name: string; cleanup: jest.Mock }[] = []
        const mountedRows = new Map<number, HtmlTemplate>()
        const trackMount = (name: string, error?: Error) => () => {
            const cleanup = jest.fn(() => {
                if (error) throw error
            })
            lifetimes.push({ name, cleanup })
            return cleanup
        }
        const [value, setValue] = state(0)
        const readValue = jest.fn(() => value())
        const reveal = jest.fn(() => html`<strong>revealed</strong>`)
        const pendingChild = visible(reveal, html`<i>pending child</i>`, {
            rootMargin: '73px',
        })
        const pendingSibling = visible(reveal, html`<i>pending sibling</i>`, {
            rootMargin: '73px',
        })
        const portable = html`<aside>${readValue}${pendingChild}</aside>`
            .onMount(trackMount('portable'))
        const throwing = html`<b>throwing</b>`
            .onMount(trackMount('throwing', cleanupError))
        const sibling = html`<b>${readValue}</b>`
            .onMount(trackMount('sibling'))
        type Row = { id: number; label: string; content: HtmlTemplate[] }
        const [rows, setRows] = state<Row[]>([])
        const [destinationItems, setDestinationItems] = state<HtmlTemplate[]>([])
        const source = html`<section>${repeat(rows, (row) =>
            html`<article data-id="${row.id}"><span>${row.label}</span>${row.content}</article>`
                .onMount((template) => {
                    mountedRows.set(row.id, template)
                    return trackMount(`row ${row.id}`)()
                }),
            { key: (row) => row.id }
        )}</section>`
        const destination = html`<main>${destinationItems}${pendingSibling}</main>`
        const report = jest.spyOn(console, 'error').mockImplementation(() => {})
        const assertOwner = (expected: HtmlTemplate) => {
            const candidates = [source, destination, ...mountedRows.values()]
            expect(candidates.filter((owner) => owner.__CHILDREN__.has(portable)))
                .toEqual([expected])
            expect(portable.__PARENT__).toBe(expected)
            expect(portable.mounted).toBe(true)
        }

        try {
            for (let cycle = 0; cycle < 4; cycle++) {
                const lifetimeStart = lifetimes.length
                mountedRows.clear()
                let currentRows: Row[] = [
                    { id: 1, label: `cycle ${cycle}`, content: [portable] },
                    { id: 2, label: 'remove throwing', content: [throwing] },
                    { id: 3, label: 'remove sibling', content: [sibling] },
                ]
                const updateRetained = (label: string, content = [portable]) => {
                    currentRows = currentRows.map((row) => row.id === 1
                        ? { ...row, label, content }
                        : row)
                    setRows(currentRows)
                    jest.runOnlyPendingTimers()
                }
                setRows(currentRows)
                setDestinationItems([])
                source.render(document.body)
                destination.render(document.body)
                const retained = mountedRows.get(1)!
                const retainedNode = retained.childNodes[0] as Element
                const portableNode = portable.childNodes[0]
                const observer = observers[cycle]
                expect(observers).toHaveLength(cycle + 1)
                expect(observer.targets.size).toBe(2)
                const targets = [...observer.targets]
                assertOwner(retained)

                updateRetained('immutable update')
                expect(mountedRows.get(1)).toBe(retained)
                expect(retained.childNodes[0]).toBe(retainedNode)
                expect(portable.childNodes[0]).toBe(portableNode)

                for (let transition = 0; transition < 5; transition++) {
                    setDestinationItems([portable])
                    jest.runOnlyPendingTimers()
                    assertOwner(destination)

                    // A newly rebound source still emitting the transferred
                    // value cannot reclaim it or end its mount lifetime.
                    updateRetained(`stale ${transition}`)
                    assertOwner(destination)
                    expect(retainedNode.querySelector('aside')).toBeNull()

                    // An absent emission releases the stale membership. Adding
                    // the same instance again explicitly transfers it back.
                    updateRetained(`release ${transition}`, [])
                    updateRetained(`reintroduce ${transition}`)
                    assertOwner(retained)
                    expect(retainedNode.querySelector('aside')).toBe(portableNode)
                    setDestinationItems([portable])
                    jest.runOnlyPendingTimers()
                    assertOwner(retained)
                    setDestinationItems([])
                    jest.runOnlyPendingTimers()
                    setValue(cycle * 10 + transition + 1)
                    jest.runOnlyPendingTimers()
                    expect(portableNode.textContent).toContain(String(value()))
                    expect(observer.targets.size).toBe(2)
                    expect(observer.disconnect).not.toHaveBeenCalled()
                    expect(lifetimes.slice(lifetimeStart)
                        .filter((entry) => entry.name === 'portable'))
                        .toHaveLength(1)
                }

                // Removing two sibling rows must finish reconciliation even
                // though one nested cleanup throws, then permit another update.
                currentRows = [{ ...currentRows[0], label: 'after removal' }]
                setRows(currentRows)
                jest.runOnlyPendingTimers()
                expect(report).toHaveBeenCalledTimes(cycle + 1)
                expect(report).toHaveBeenLastCalledWith(cleanupError)
                expect(throwing.mounted).toBe(false)
                expect(sibling.mounted).toBe(false)
                expect(document.querySelectorAll('article')).toHaveLength(1)
                expect(document.querySelector('article')).toBe(retainedNode)
                updateRetained('later update works')
                expect(retainedNode.querySelector('span')?.textContent)
                    .toBe('later update works')
                assertOwner(retained)

                destination.unmount()
                assertOwner(retained)
                expect(observer.unobserve).toHaveBeenCalledTimes(1)
                expect(observer.disconnect).not.toHaveBeenCalled()
                source.unmount()
                expect(portable.mounted).toBe(false)
                expect(portable.__PARENT__).toBeNull()
                expect(source.__CHILDREN__.size).toBe(0)
                expect(destination.__CHILDREN__.size).toBe(0)
                expect(observer.unobserve).toHaveBeenCalledTimes(2)
                expect(observer.disconnect).toHaveBeenCalledTimes(1)
                expect(observer.targets.size).toBe(0)
                expect(document.body.innerHTML).toBe('')
                for (const { cleanup } of lifetimes.slice(lifetimeStart)) {
                    expect(cleanup).toHaveBeenCalledTimes(1)
                }

                const readsAfterDisposal = readValue.mock.calls.length
                setValue(1000 + cycle)
                setRows([...currentRows])
                setDestinationItems([portable])
                targets.forEach((target) => observer.emit(target))
                jest.runOnlyPendingTimers()
                expect(readValue).toHaveBeenCalledTimes(readsAfterDisposal)
                expect(reveal).not.toHaveBeenCalled()
                expect(document.body.innerHTML).toBe('')
            }
            expect(lifetimes.filter((entry) => entry.name === 'portable'))
                .toHaveLength(4)
            for (const { cleanup } of lifetimes) {
                expect(cleanup).toHaveBeenCalledTimes(1)
            }
        } finally {
            try {
                destination.unmount()
                source.unmount()
            } finally {
                report.mockRestore()
                if (originalObserver) {
                    Object.defineProperty(globalThis, 'IntersectionObserver', originalObserver)
                } else {
                    Reflect.deleteProperty(globalThis, 'IntersectionObserver')
                }
            }
        }
    })
})
