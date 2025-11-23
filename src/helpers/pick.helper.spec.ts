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

	it('should handle pick with mapper', () => {
		// map numbers
		expect(pick(() => obj, 'sample.deep.value', (v) => (v as number) * 2)()).toEqual(24)
		expect(pick(() => obj, 'sample.list.0', (v) => (v as number) + 10)()).toEqual(22)

		// map strings
		expect(pick(() => obj, 'x.0.name', (v) => (v as string).toUpperCase())()).toEqual('JOHN DOE')
		expect(pick(() => obj, 'x.1.name', (v) => `Hello, ${v}`)()).toEqual('Hello, jane doe')

		// map objects
		expect(pick(() => obj, 'x.0', (v) => (v as {name: string}).name)()).toEqual('john doe')
		expect(pick(() => obj, 'sample.deep', (v) => JSON.stringify(v))()).toEqual('{"value":12}')

		// map arrays
		expect(pick(() => obj, 'sample.list', (v) => (v as number[]).length)()).toEqual(2)
		expect(pick(() => obj, 'sample.list', (v) => (v as number[]).map(n => n * 2))()).toEqual([24, 46])
		expect(pick(() => obj, 'x', (v) => (v as Array<{name: string}>).map(item => item.name))()).toEqual(['john doe', 'jane doe'])

		// map undefined values
		expect(pick(() => obj, 'sample.x', (v) => v ?? 'default')()).toEqual('default')
		expect(pick(() => obj, 'x.3.name', (v) => v || 'not found')()).toEqual('not found')

		// complex transformations
		expect(pick(() => obj, 'sample.list.0', (v) => ({doubled: (v as number) * 2}))()).toEqual({doubled: 24})
		expect(pick(() => obj, 'x.0.name', (v) => (v as string).split(' ')[0])()).toEqual('john')
	})
})
