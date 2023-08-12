import {repeat} from "./repeat.helper";
import {html} from "../html";

describe("repeat", () => {
	it('should handle number', () => {
		expect(repeat(3, n => n)()).toEqual([1, 2, 3])

		let count = 3;
		const r = repeat(() => count, n => html`sample-${n}`);

		const res = r();

		count = 4;

		const res2 = r();

		expect(res).toHaveLength(3)
		expect(res2).toHaveLength(4)

		expect(res[0]).toEqual(res2[0])
		expect(res[1]).toEqual(res2[1])
		expect(res[2]).toEqual(res2[2])
	});

	it('should handle array with unique values', () => {
		let list = Array.from({length: 3}, (_, i) => i+1);

		expect(repeat(list, n => n+1)()).toEqual([2, 3, 4])

		const r = repeat(() => list, n => html`sample-${n}`);

		const res = r();

		list.push(4);

		const res2 = r();

		expect(res).toHaveLength(3)
		expect(res2).toHaveLength(4)

		expect(res[0]).toEqual(res2[0])
		expect(res[1]).toEqual(res2[1])
		expect(res[2]).toEqual(res2[2])
	});
	
	it('should handle array with repeated values', () => {
		let list = Array.from({length: 3}, () => '-');
		
		expect(repeat(list, n => n)()).toEqual([
			"-",
			"-",
			"-"
		])
		
		const r = repeat(() => list, n => html`sample-${n}`);

		const res = r();

		list.push('--');

		const res2 = r();

		expect(res).toHaveLength(3)
		expect(res2).toHaveLength(4)

		expect(res[0]).toEqual(res2[0])
		expect(res[1]).toEqual(res2[1])
		expect(res[2]).toEqual(res2[2])
	});
})
