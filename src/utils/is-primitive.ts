export const isPrimitive = (val: any) => {
	return val === null || /number|string|bigint|boolean|symbol|undefined/.test(typeof val)
}