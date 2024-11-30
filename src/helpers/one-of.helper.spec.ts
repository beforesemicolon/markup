import {oneOf} from "./one-of.helper.ts";

describe('oneOf', () => {// @ts-ignore
	it('should handle oneOf', () => {
		expect(oneOf('one', [])()).toBe(false)
		expect(oneOf('one', ['one'])()).toBe(true)
		expect(oneOf(() => 'one', ['one', 'two', 'three'])()).toBe(true)
		expect(oneOf(() => 'four', ['one', 'two', 'three'])()).toBe(false)
	})
})
