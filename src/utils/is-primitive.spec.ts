import { isPrimitive } from './is-primitive'

describe('isPrimitive', () => {
    it('should be primitive', () => {
        expect(isPrimitive('sample')).toBeTruthy()
        expect(isPrimitive(12)).toBeTruthy()
        expect(isPrimitive(true)).toBeTruthy()
        expect(isPrimitive(BigInt(1))).toBeTruthy()
        expect(isPrimitive(Symbol('ss'))).toBeTruthy()
        expect(isPrimitive(undefined)).toBeTruthy()
    })

    it('should NOT be primitive', () => {
        expect(isPrimitive(null)).toBeFalsy()
        expect(isPrimitive([])).toBeFalsy()
        expect(isPrimitive({})).toBeFalsy()
        expect(isPrimitive(new Map())).toBeFalsy()
        expect(isPrimitive(new Set())).toBeFalsy()
    })
})
