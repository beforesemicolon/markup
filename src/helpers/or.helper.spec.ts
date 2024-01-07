import {or} from "./or.helper";

describe('or', () => {// @ts-ignore
	const O = or().handler
	
	it('should handle or', () => {
		expect(O(() => true, () => true)).toBe(true)
		expect(O(true, true, true)).toBe(true)
		expect(O(false, false, false)).toBe(false)
		expect(O(false, false, true)).toBe(true)
		expect(() => O(true)).toThrowError('The "or" helper requires at least two arguments.')
		expect(O(() => true, () => false)).toBe(true)
		expect(O(() => false, () => false)).toBe(false)
	})
})
