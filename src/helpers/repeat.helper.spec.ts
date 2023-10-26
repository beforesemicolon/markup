import { repeat } from './repeat.helper'
import { html } from '../html'

describe('repeat', () => {
    // @ts-ignore
    const R = repeat().handler

    it('should handle number', () => {
        expect(R(3, (n: number) => n)()).toEqual([1, 2, 3])

        let count = 3
        const r = R(
            () => count,
            (n: number) => html`sample-${n}`
        )

        const res = r()

        count = 4

        const res2 = r()

        expect(res).toHaveLength(3)
        expect(res2).toHaveLength(4)

        expect(res[0]).toEqual(res2[0])
        expect(res[1]).toEqual(res2[1])
        expect(res[2]).toEqual(res2[2])
    })
    
    it('should handle empty', () => {
        expect(R([], (n: number) => n, () => 'no items')()).toEqual('no items')
        expect(R(null, (n: number) => n, () => 'no items')()).toEqual('no items')
        expect(R(null, (n: number) => n)()).toEqual('')
    })

    it('should handle array with unique values', () => {
        const list = Array.from({ length: 3 }, (_, i) => i + 1)

        expect(R(list, (n: number) => n + 1)()).toEqual([2, 3, 4])

        const r = R(
            () => list,
            (n: number) => html`sample-${n}`
        )

        const res = r()

        list.push(4)

        const res2 = r()

        expect(res).toHaveLength(3)
        expect(res2).toHaveLength(4)

        expect(res[0]).toEqual(res2[0])
        expect(res[1]).toEqual(res2[1])
        expect(res[2]).toEqual(res2[2])
    })

    it('should handle array with repeated values', () => {
        const list = Array.from({ length: 3 }, () => '-')

        expect(R(list, (n: number) => n)()).toEqual(['-', '-', '-'])

        const r = R(
            () => list,
            (n: number) => html`sample-${n}`
        )

        const res = r()

        list.push('--')

        const res2 = r()

        expect(res).toHaveLength(3)
        expect(res2).toHaveLength(4)

        expect(res[0]).toEqual(res2[0])
        expect(res[1]).toEqual(res2[1])
        expect(res[2]).toEqual(res2[2])
    })
})
