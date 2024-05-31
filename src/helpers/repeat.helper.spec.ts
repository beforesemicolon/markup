import { repeat } from './repeat.helper'
import { html, HtmlTemplate } from '../html'

describe('repeat', () => {

    it('should handle number', () => {
        expect(repeat(3, (n: number) => n)()).toEqual([1, 2, 3])

        let count = 3
        const r = repeat<number>(
            () => count,
            (n: number) => html`sample-${n}`
        )

        const res = r() as HtmlTemplate[]

        count = 4

        const res2 = r() as HtmlTemplate[]

        expect(res).toHaveLength(3)
        expect(res2).toHaveLength(4)

        expect(res[0]).toEqual(res2[0])
        expect(res[1]).toEqual(res2[1])
        expect(res[2]).toEqual(res2[2])
    })
    
    it('should handle empty', () => {
        expect(repeat([], (n) => n, () => 'no items')()).toEqual('no items')
        expect(repeat(0, (n) => n, () => 'no items')()).toEqual('no items')
        expect(repeat(0, (n) => n)()).toEqual('')
    })

    it('should handle array with unique values', () => {
        const list = Array.from({ length: 3 }, (_, i) => i + 1)

        expect(repeat(list, (n: number) => n + 1)()).toEqual([2, 3, 4])

        const r = repeat(
            () => list,
            (n: number) => html`sample-${n}`
        )

        const res = r() as HtmlTemplate[]

        list.push(4)

        const res2 = r() as HtmlTemplate[]

        expect(res).toHaveLength(3)
        expect(res2).toHaveLength(4)

        expect(res[0]).toEqual(res2[0])
        expect(res[1]).toEqual(res2[1])
        expect(res[2]).toEqual(res2[2])
    })

    it('should handle array with repeated values', () => {
        const list = Array.from({ length: 3 }, () => '-')

        expect(repeat(list, (n) => n)()).toEqual(['-', '-', '-'])

        const r = repeat(
            () => list,
            (n) => html`sample-${n}`
        )

        const res = r() as HtmlTemplate[]

        list.push('--')

        const res2 = r() as HtmlTemplate[]

        expect(res).toHaveLength(3)
        expect(res2).toHaveLength(4)

        expect(res[0]).toEqual(res2[0])
        expect(res[1]).toEqual(res2[1])
        expect(res[2]).toEqual(res2[2])
    })
})
