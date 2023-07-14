import {when} from "./when.helper";

describe("when", () => {
	it('should handle condition', () => {
		expect(when(true, "sample", "other")()).toBe("sample")
		expect(when(false, "sample", "other")()).toBe("other")
	});
})
