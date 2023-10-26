import {is} from "./is.helper";

describe('is', () => { // @ts-ignore
	const I = is().handler
	
	it('should handle is', () => {
		expect(I(() => true, true)).toBe(true)
		expect(I(() => true, () =>false)).toBe(false)
	})
})
