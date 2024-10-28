import { when } from './when.helper.ts'

describe('when', () => {

    it('should handle condition', () => {
        expect(when(true, 'sample', 'other')()).toBe('sample')
        expect(when('', 'sample', 'other')()).toBe('other')
        expect(when('yes', 'sample', 'other')()).toBe('sample')
        expect(when(false, 'sample', 'other')()).toBe('other')
        expect(when('no', 'sample', 'other')()).toBe('sample')
        expect(when(0, 'sample', 'other')()).toBe('other')
        expect(when(() => 12, 'sample', 'other')()).toBe('sample')
        expect(when(() => null, 'sample')()).toBe('')
        expect(when(null, 'sample')()).toBe('')
        expect(when(() => undefined, 'sample')()).toBe('')
        expect(when(undefined, 'sample')()).toBe('')
    })
})
