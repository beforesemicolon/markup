import {or} from "./or.helper";

describe('or', () => {// @ts-ignore
	const O = or().handler
	
	it('should handle or', () => {
		expect(O(() => true, () => true)).toBe(true)
		expect(O(() => true, () => false)).toBe(true)
		expect(O(() => false, () => false)).toBe(false)
	})
})
