import {effect} from "./effect.helper";

describe('effect', () => {// @ts-ignore
	const E = effect().handler
	
	it('should handle effect', () => {
		expect(E(true, 'sample', 'other')).toBe('other')
	})
})
