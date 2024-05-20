import {isNot} from "./is-not.helper";

describe('isNot', () => { // @ts-ignore

	it('should handle isNot', () => {
		expect(isNot(() => true, true)).toBe(false)
		expect(isNot(() => true, () => false)).toBe(true)
	})
})
