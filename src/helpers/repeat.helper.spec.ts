import '../../test.common'
import { repeat } from './repeat.helper'
import { html } from '../html'

describe('repeat', () => {
    const anchor = document.createTextNode('');
    
    beforeEach(() => {
        document.body.appendChild(anchor)
    })

    it('should handle number', () => {
        repeat(3, (n: number) => n)(anchor);
        
        expect(document.body.innerHTML).toBe('123')
    })
    
    it('should handle updates', () => {
        let count = 3
        const r = repeat<number>(
            () => count,
            (n: number) => html`sample-${n}`
        )
        
        r(anchor)
        
        expect(document.body.innerHTML).toBe('sample-1sample-2sample-3')
        
        count = 4
        
        r(anchor)
        
        expect(document.body.innerHTML).toBe('sample-1sample-2sample-3sample-4')
    })
    
    it('should handle empty', () => {
        repeat([], (n) => n)(anchor)
        repeat([], (n) => n, () => 'no items')(anchor)
        
        expect(document.body.innerHTML).toBe('no items')
    })

    it('should handle array with unique primitives', () => {
        const list = Array.from({ length: 3 }, (_, i) => i + 1)
        
        repeat(list, (n: number) => n + 1)(anchor)
        
        expect(document.body.innerHTML).toBe('234')
    })
    
    it('should handle array with unique non-primitives', () => {
        const list = Array.from({ length: 3 }, (_, i) => i + 1)
        
        const r = repeat(
            () => list,
            (n: number) => html`sample-${n}`
        )
        
        r(anchor)
        
        expect(document.body.innerHTML).toBe('sample-1sample-2sample-3')
        
        list.push(4)
        
        r(anchor)
        
        expect(document.body.innerHTML).toBe('sample-1sample-2sample-3sample-4')
    })

    it('should handle array with repeated values', () => {
        const list = Array.from({ length: 3 }, () => 1)

        const r = repeat(
            () => list,
            (n) => html`sample-${n}`
        )

        r(anchor)
        
        expect(document.body.innerHTML).toBe('sample-1')

        list.push(2)

        r(anchor)
        
        expect(document.body.innerHTML).toBe('sample-1sample-2')
    })
})
