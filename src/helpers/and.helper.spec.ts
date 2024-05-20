import {and} from "./and.helper";

describe('and', () => {// @ts-ignore

	it('should handle and', () => {
		expect(and(() => true, () => true)).toBe(true)
		expect(() => and(true)).toThrowError('The "and" helper requires at least two arguments.')
		expect(and(true, true, true)).toBe(true)
		expect(and(true, true, false)).toBe(false)
		expect(and(() => true, () => false)).toBe(false)
		expect(and(() => false, () => false)).toBe(false)
		expect(and(() => false, () => false, false)).toBe(false)
	})
	
})
