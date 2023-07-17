export const isPrimitive = (val: any) => {
	return val === null || /undefined|number|string|bigint|boolean|symbol/.test(typeof val)
}