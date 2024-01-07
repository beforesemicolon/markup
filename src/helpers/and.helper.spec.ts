import {and} from "./and.helper";

describe('and', () => {// @ts-ignore
	const A = and().handler
	
	it('should handle and', () => {
		expect(A(() => true, () => true)).toBe(true)
		expect(() => A(true)).toThrowError('The "and" helper requires at least two arguments.')
		expect(A(true, true, true)).toBe(true)
		expect(A(true, true, false)).toBe(false)
		expect(A(() => true, () => false)).toBe(false)
		expect(A(() => false, () => false)).toBe(false)
		expect(A(() => false, () => false, false)).toBe(false)
	})
	
})
