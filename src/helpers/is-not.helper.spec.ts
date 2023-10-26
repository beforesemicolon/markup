import {isNot} from "./is-not.helper";

describe('isNot', () => { // @ts-ignore
	const I = isNot().handler
	
	it('should handle isNot', () => {
		expect(I(() => true, true)).toBe(false)
		expect(I(() => true, () => false)).toBe(true)
	})
})
