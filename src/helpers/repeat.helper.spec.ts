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
})
