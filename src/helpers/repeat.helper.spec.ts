import '../../test.common.ts'
import { repeat } from './repeat.helper.ts'
import { html } from '../html.ts'
import { state } from '../state.ts'

type Item = {
    id: number
    name: string
    active?: boolean
    kind?: 'span' | 'strong'
    onClick?: () => void
}

describe('repeat', () => {
    it('should handle number', () => {
        expect(repeat(3, (n: number) => n)()).toEqual([1, 2, 3])
    })

    it('should handle updates', () => {
        let count = 3
        const r = repeat<number>(
            () => count,
            (n: number) => html`sample-${n}`
        )

        r()

        expect(r()).toHaveLength(3)

        count = 4
        
        expect(r()).toHaveLength(4)
    })

    it('should handle empty', () => {
        expect(repeat([], (n) => n, () => 'no items')()).toEqual('no items')
        expect(repeat({}, (n) => n, () => 'no items')()).toEqual('no items')
        expect(repeat(new Set(), (n) => n, () => 'no items')()).toEqual('no items')
        expect(repeat(new Map(), (n) => n, () => 'no items')()).toEqual('no items')
    })

    it('should handle array with unique primitives', () => {
        const list = Array.from({ length: 3 }, (_, i) => i + 1)

        expect(repeat(list, (n: number) => n + 1)()).toEqual([2, 3, 4])
    })

    it('should handle array with unique non-primitives', () => {
        const list = Array.from({ length: 3 }, (_, i) => i + 1)

        const r = repeat(
            () => list,
            (n: number) => html`sample-${n}`
        )
        
        expect(r()).toHaveLength(3)

        list.push(4)
        
        expect(r()).toHaveLength(4)
    })

    it('should handle array with repeated values', () => {
        const list = Array.from({ length: 3 }, () => 1)

        const r = repeat(
            () => list,
            (n) => html`sample-${n}`
        )
        
        expect(r()).toHaveLength(1)

        list.push(2)
        
        expect(r()).toHaveLength(2)
    })
    
    it('should handle iterables', () => {
        const iterable = {};
        
        // @ts-ignore
        iterable[Symbol.iterator] = function* () {
            yield 1;
            yield 2;
            yield 3;
        };
        
        expect(repeat(new Set([1, 2, 3]), (n) => n)()).toEqual([1, 2, 3])
        expect(repeat(new Map([['a', 'b']]), (n) => n)()).toEqual([['a', 'b']])
        expect(repeat({sample: 12}, (n) => n)()).toEqual([['sample', 12]])
        expect(repeat('sample', (n) => n)()).toEqual(['s', 'a', 'm', 'p', 'l', 'e'])
        expect(repeat(iterable, (n) => n)()).toEqual([1, 2, 3])
    })

    it('should support keyed options object', () => {
        const list = [{ id: 'a', val: 1 }, { id: 'b', val: 2 }];
        const r = repeat(
            () => list,
            (item) => item.val,
            { key: (item) => item.id }
        );
        expect(r()).toEqual([1, 2]);
    });

    it('should throw error on duplicate keys in explicit keyed mode', () => {
        const list = [{ id: 'a', val: 1 }, { id: 'a', val: 2 }];
        const r = repeat(
            () => list,
            (item) => item.val,
            { key: (item) => item.id }
        );
        expect(() => r()).toThrow('Duplicate key "a" detected at index 1 in repeat');
    });

    it('should reuse rendered items for stable key and object reference', () => {
        const list = [{ id: 'a', val: 1 }, { id: 'b', val: 2 }];
        let calls = 0;
        const r = repeat(
            () => list,
            (item) => {
                calls++;
                return html`val-${item.val}`;
            },
            { key: (item) => item.id }
        );

        const res1 = r() as any[];
        expect(calls).toBe(2);

        // evaluate again with same references
        const res2 = r() as any[];
        expect(calls).toBe(2);
        expect(res1[0]).toBe(res2[0]);
    });

    it('should recreate rendered items when key matches but object reference changes', () => {
        let list = [{ id: 'a', val: 1 }, { id: 'b', val: 2 }];
        let calls = 0;
        const r = repeat(
            () => list,
            (item) => {
                calls++;
                return html`val-${item.val}`;
            },
            { key: (item) => item.id }
        );

        const res1 = r() as any[];
        expect(calls).toBe(2);

        // change list to new array with a new object reference for id 'a'
        list = [{ id: 'a', val: 10 }, list[1]];
        const res2 = r() as any[];
        // calls should increment by 1 for the changed object
        expect(calls).toBe(3);
        expect(res2[0]).not.toBe(res1[0]); // first template recreated
        expect(res2[1]).toBe(res1[1]); // second template reused
    });
})

describe('repeat keyed template rebinding', () => {
    it('reuses DOM identity for immutable keyed primitive updates', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'first', active: false },
        ])
        const renderer = jest.fn(
            (item: Item) => html`<span
                class="${item.active ? 'active' : ''}"
                data-name="${item.name}"
            >${item.name}</span>`
        )
        const view = html`${repeat(items, renderer, {
            key: (item) => item.id,
        })}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'updated', active: true }])
        jest.advanceTimersToNextTimer()

        const updatedNode = document.body.querySelector('span')
        expect(updatedNode).toBe(firstNode)
        expect(updatedNode?.textContent).toBe('updated')
        expect(updatedNode?.className).toBe('active')
        expect(updatedNode?.getAttribute('data-name')).toBe('updated')
        expect(renderer).toHaveBeenCalledTimes(2)
    })

    it('reuses each keyed row independently', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one' },
            { id: 2, name: 'two' },
        ])
        const view = html`${repeat(
            items,
            (item) => html`<span>${item.name}</span>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const before = Array.from(document.body.querySelectorAll('span'))

        setItems([
            { id: 1, name: 'ONE' },
            { id: 2, name: 'TWO' },
        ])
        jest.advanceTimersToNextTimer()

        const after = Array.from(document.body.querySelectorAll('span'))
        expect(after[0]).toBe(before[0])
        expect(after[1]).toBe(before[1])
        expect(after.map((node) => node.textContent)).toEqual([
            'ONE',
            'TWO',
        ])
    })

    it('reuses keyed rows while updating event handlers', () => {
        const firstHandler = jest.fn()
        const nextHandler = jest.fn()
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one', onClick: firstHandler },
        ])
        const view = html`${repeat(
            items,
            (item) =>
                html`<button onclick="${item.onClick}">${item.name}</button>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const button = document.body.querySelector('button')!
        button.click()

        setItems([{ id: 1, name: 'ONE', onClick: nextHandler }])
        jest.advanceTimersToNextTimer()

        const updatedButton = document.body.querySelector('button')!
        updatedButton.click()

        expect(updatedButton).toBe(button)
        expect(updatedButton.textContent).toBe('ONE')
        expect(firstHandler).toHaveBeenCalledTimes(1)
        expect(nextHandler).toHaveBeenCalledTimes(1)
    })

    it('falls back to replacement when the template shape changes', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one', kind: 'span' },
        ])
        const view = html`${repeat(
            items,
            (item) =>
                item.kind === 'span'
                    ? html`<span>${item.name}</span>`
                    : html`<strong>${item.name}</strong>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'one', kind: 'strong' }])
        jest.advanceTimersToNextTimer()

        const strong = document.body.querySelector('strong')
        expect(strong).not.toBeNull()
        expect(strong).not.toBe(firstNode)
        expect(document.body.querySelector('span')).toBeNull()
    })

    it('falls back for lifecycle templates to preserve mount cleanup behavior', () => {
        const mount = jest.fn(() => cleanup)
        const cleanup = jest.fn()
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one' },
        ])
        const view = html`${repeat(
            items,
            (item) => html`<span>${item.name}</span>`.onMount(mount),
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'ONE' }])
        jest.advanceTimersToNextTimer()

        expect(document.body.querySelector('span')).not.toBe(firstNode)
        expect(mount).toHaveBeenCalledTimes(2)
        expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it('falls back for reactive function slots', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one' },
        ])
        const view = html`${repeat(
            items,
            (item) => html`<span>${() => item.name}</span>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'ONE' }])
        jest.advanceTimersToNextTimer()

        expect(document.body.querySelector('span')).not.toBe(firstNode)
        expect(document.body.textContent).toBe('ONE')
    })

    it('rebinds reactive attribute slots without replacing keyed rows', () => {
        const [selectedId, setSelectedId] = state<number | null>(null)
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one' },
        ])
        const view = html`${repeat(
            items,
            (item) => html`<span
                class="${() => (selectedId() === item.id ? 'active' : '')}"
            >${item.name}</span>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'ONE' }])
        jest.advanceTimersToNextTimer()

        const updatedNode = document.body.querySelector('span')
        expect(updatedNode).toBe(firstNode)
        expect(updatedNode?.textContent).toBe('ONE')

        setSelectedId(1)
        jest.advanceTimersToNextTimer()
        expect(updatedNode?.className).toBe('active')
    })

    it('falls back for nested template values', () => {
        const [items, setItems] = state<Item[]>([
            { id: 1, name: 'one' },
        ])
        const view = html`${repeat(
            items,
            (item) => html`<span>${html`<b>${item.name}</b>`}</span>`,
            { key: (item) => item.id }
        )}`

        view.render(document.body)
        const firstNode = document.body.querySelector('span')

        setItems([{ id: 1, name: 'ONE' }])
        jest.advanceTimersToNextTimer()

        expect(document.body.querySelector('span')).not.toBe(firstNode)
        expect(document.body.innerHTML).toBe('<span><b>ONE</b></span>')
    })

    it('keeps the existing stable-reference renderer cache behavior', () => {
        const item = { id: 1, name: 'one' }
        const renderer = jest.fn(
            (value: Item) => html`<span>${value.name}</span>`
        )
        const read = repeat([item], renderer, {
            key: (value) => value.id,
        })

        const first = read() as unknown[]
        const second = read() as unknown[]

        expect(second[0]).toBe(first[0])
        expect(renderer).toHaveBeenCalledTimes(1)
    })
})
