import { when } from './when.helper'

describe('when', () => {
    // @ts-ignore
    const W = when().handler

    it('should handle condition', () => {
        expect(W(true, 'sample', 'other')()).toBe('sample')
        expect(W('', 'sample', 'other')()).toBe('other')
        expect(W('yes', 'sample', 'other')()).toBe('sample')
        expect(W(false, 'sample', 'other')()).toBe('other')
        expect(W('no', 'sample', 'other')()).toBe('sample')
        expect(W(0, 'sample', 'other')()).toBe('other')
        expect(W(() => 12, 'sample', 'other')()).toBe('sample')
        expect(W(() => null, 'sample')()).toBe('')
        expect(W(null, 'sample')()).toBe('')
        expect(W(() => undefined, 'sample')()).toBe('')
        expect(W(undefined, 'sample')()).toBe('')
    })
})
