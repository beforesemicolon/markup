import {or} from "./or.helper.ts";

describe('or', () => {// @ts-ignore

	it('should handle or', () => {
		expect(or(() => true, () => true)()).toBe(true)
		expect(or(true, true, true)()).toBe(true)
		expect(or(false, false, false)()).toBe(false)
		expect(or(false, false, true)()).toBe(true)
		expect(() => or(true)).toThrowError('The "or" helper requires at least two arguments.')
		expect(or(() => true, () => false)()).toBe(true)
		expect(or(() => false, () => false)()).toBe(false)
	})
})
