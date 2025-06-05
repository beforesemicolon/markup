import {isNot} from "./is-not.helper.ts";

describe('isNot', () => { // @ts-ignore

	it('should handle isNot', () => {
		expect(isNot(() => true, true)()).toBe(false)
		expect(isNot(() => true, false)()).toBe(true)
		expect(isNot(() => true, () => false)()).toBe(true)
		expect(isNot(12, /[0-9]+/)()).toBe(false)
		expect(isNot(12, /^[0-9]$/)()).toBe(true)
		expect(isNot('idle', /^(idle|loading)$/)()).toBe(false)
	})
})
