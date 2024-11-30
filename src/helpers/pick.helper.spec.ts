import {pick} from "./pick.helper.ts";

describe('pick', () => { // @ts-ignore

	const obj = {
		sample: {
			list: [12, 23],
			deep: {
				value: 12
			}
		},
		x: [{name: 'john doe'}, {name: 'jane doe'}]
	}
	
	it('should handle pick', () => {
		expect(pick(() => obj, 'sample')()).toEqual(obj.sample)
		expect(pick(() => obj, 'sample.list')()).toEqual(obj.sample.list)
		expect(pick(() => obj, 'sample.list.0')()).toEqual(obj.sample.list[0])
		expect(pick(() => obj, 'sample.list.1')()).toEqual(obj.sample.list[1])
		expect(pick(() => obj, 'sample.list.length')()).toEqual(obj.sample.list.length)
		expect(pick(() => obj, 'sample.deep')()).toEqual(obj.sample.deep)
		expect(pick(() => obj, 'sample.deep.value')()).toEqual(obj.sample.deep.value)
		expect(pick(() => obj, 'x')()).toEqual(obj.x)
		expect(pick(() => obj, 'x.0')()).toEqual(obj.x[0])
		expect(pick(() => obj, 'x.0.name')()).toEqual(obj.x[0].name)
		expect(pick(() => obj, 'x.1')()).toEqual(obj.x[1])
		expect(pick(() => obj, 'x.1.name')()).toEqual(obj.x[1].name)
		// undefined
		expect(pick(() => obj, 'sample.x')()).toEqual(undefined)
		expect(pick(() => obj, 'x.3.name')()).toEqual(undefined)
		expect(pick(() => obj, 'x.0.value')()).toEqual(undefined)
	})
})
