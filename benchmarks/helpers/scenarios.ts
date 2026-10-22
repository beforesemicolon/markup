import assert from 'node:assert/strict'
import type { Bench } from 'tinybench'
import { copyItems, type StableItem } from './fixtures.ts'

export type UpdateOperation =
    | 'same-array'
    | 'new-array'
    | 'immutable'
    | 'append'
    | 'prepend'
    | 'remove'
    | 'reverse'

export interface BenchmarkSuite {
    bench: Bench
    verifiedIterations: Map<string, number>
    dispose: () => void
}

export const flushRenderQueue = () =>
    new Promise<void>((resolve) => queueMicrotask(resolve))

// Fixture allocation belongs in beforeEach, outside Tinybench's timer.
export function prepareUpdate(
    items: StableItem[],
    operation: UpdateOperation
): StableItem[] {
    switch (operation) {
        case 'same-array':
            return items
        case 'new-array':
            return [...items]
        case 'immutable':
            return copyItems(items)
        case 'append':
            return [
                ...items,
                { id: items.length + 1, name: `item-${items.length + 1}` },
            ]
        case 'prepend':
            return [{ id: 0, name: 'item-0' }, ...items]
        case 'remove':
            return items.filter(
                (_, index) => index !== Math.floor(items.length / 2)
            )
        case 'reverse':
            return [...items].reverse()
    }
}

export function expectedRenderCalls(
    size: number,
    operation: UpdateOperation
): number {
    if (operation === 'immutable') return size
    if (operation === 'append') return 1
    if (operation === 'prepend') return size + 1
    if (operation === 'remove') return size - Math.floor(size / 2) - 1
    if (operation === 'reverse') return size - (size % 2)
    return 0
}

export function assertItems(actual: unknown, expected: StableItem[]): void {
    assert.ok(Array.isArray(actual))
    assert.equal(actual.length, expected.length, 'unexpected item count')
    for (const [index, item] of expected.entries()) {
        assert.equal(actual[index], item, `unexpected item at index ${index}`)
    }
}

export function assertUpdate(
    before: StableItem[],
    after: StableItem[],
    operation: UpdateOperation
): void {
    const delta =
        operation === 'append' || operation === 'prepend'
            ? 1
            : operation === 'remove'
              ? -1
              : 0
    assert.equal(after.length, before.length + delta, `${operation}: row delta`)

    if (operation === 'same-array') assert.equal(after, before)
    else assert.notEqual(after, before)

    if (operation === 'append') assertItems(after.slice(0, -1), before)
    if (operation === 'prepend') assertItems(after.slice(1), before)
    if (operation === 'new-array') assertItems(after, before)
    if (operation === 'immutable') {
        assert.deepEqual(after, before)
        after.forEach((item, index) => assert.notEqual(item, before[index]))
    }
    if (operation === 'remove') {
        const middle = Math.floor(before.length / 2)
        assertItems(after, [
            ...before.slice(0, middle),
            ...before.slice(middle + 1),
        ])
    }
    if (operation === 'reverse') assertItems(after, [...before].reverse())
}

export function getRows(container: Element): Map<number, Element> {
    return new Map(
        Array.from(container.querySelectorAll('[data-id]'), (node) => [
            Number(node.getAttribute('data-id')),
            node,
        ])
    )
}

export function assertRows(
    container: Element,
    expected: StableItem[],
    previous?: Map<number, Element>
): void {
    const nodes = Array.from(container.querySelectorAll('[data-id]'))
    assert.deepEqual(
        nodes.map((node) => Number(node.getAttribute('data-id'))),
        expected.map((item) => item.id),
        'unexpected row count or order'
    )
    if (previous) {
        for (const [index, item] of expected.entries()) {
            const oldNode = previous.get(item.id)
            if (oldNode) {
                assert.equal(
                    nodes[index],
                    oldNode,
                    `row ${item.id} lost its DOM identity`
                )
            }
        }
    }
}
