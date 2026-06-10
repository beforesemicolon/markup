import '../../test.common.ts'
import { repeat } from './repeat.helper.ts'
import { html } from '../html.ts'

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
