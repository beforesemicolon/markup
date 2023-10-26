import {pick} from "./pick.helper";

describe('pick', () => { // @ts-ignore
	const P = pick().handler
	
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
		expect(P(() => obj, 'sample')).toEqual(obj.sample)
		expect(P(() => obj, 'sample.list')).toEqual(obj.sample.list)
		expect(P(() => obj, 'sample.list.0')).toEqual(obj.sample.list[0])
		expect(P(() => obj, 'sample.list.1')).toEqual(obj.sample.list[1])
		expect(P(() => obj, 'sample.list.length')).toEqual(obj.sample.list.length)
		expect(P(() => obj, 'sample.deep')).toEqual(obj.sample.deep)
		expect(P(() => obj, 'sample.deep.value')).toEqual(obj.sample.deep.value)
		expect(P(() => obj, 'x')).toEqual(obj.x)
		expect(P(() => obj, 'x.0')).toEqual(obj.x[0])
		expect(P(() => obj, 'x.0.name')).toEqual(obj.x[0].name)
		expect(P(() => obj, 'x.1')).toEqual(obj.x[1])
		expect(P(() => obj, 'x.1.name')).toEqual(obj.x[1].name)
		// undefined
		expect(P(() => obj, 'sample.x')).toEqual(undefined)
		expect(P(() => obj, 'x.3.name')).toEqual(undefined)
		expect(P(() => obj, 'x.0.value')).toEqual(undefined)
	})
})
