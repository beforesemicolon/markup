import {isNot} from "./is-not.helper.ts";

describe('isNot', () => { // @ts-ignore

	it('should handle isNot', () => {
		expect(isNot(() => true, true)()).toBe(false)
		expect(isNot(() => true, () => false)()).toBe(true)
	})
})
