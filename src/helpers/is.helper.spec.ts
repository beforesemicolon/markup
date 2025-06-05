import {is} from "./is.helper.ts";

describe('is', () => { // @ts-ignore

	it('should handle is', () => {
		expect(is(() => true, true)()).toBe(true)
		expect(is(() => true, false)()).toBe(false)
		expect(is(() => true, () => false)()).toBe(false)
		expect(is(12, /[0-9]+/)()).toBe(true)
		expect(is(12, /^[0-9]$/)()).toBe(false)
		expect(is('idle', /^(idle|loading)$/)()).toBe(true)
	})
})
