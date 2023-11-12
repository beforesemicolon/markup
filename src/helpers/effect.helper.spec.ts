import {effect} from "./effect.helper";
import {repeat} from "./repeat.helper";

describe('effect', () => {// @ts-ignore
	const E = effect().handler
	
	it('should handle effect', () => {
		expect(E(true, 'sample', 'other')).toBe('other')
		expect(E(true, 'sample', repeat(2, n => n))).toEqual([1, 2])
	})
})
