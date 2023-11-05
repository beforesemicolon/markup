import {oneOf} from "./one-of.helper";

describe('oneOf', () => {// @ts-ignore
	const O = oneOf().handler
	
	it('should handle oneOf', () => {
		expect(O('one', [])).toBe(false)
		expect(O('one', ['one'])).toBe(true)
		expect(O(() => 'one', ['one', 'two', 'three'])).toBe(true)
		expect(O(() => 'four', ['one', 'two', 'three'])).toBe(false)
	})
})
