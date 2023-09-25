export const isObjectLiteral = (val: unknown) => val
	&& Object.prototype.toString.call(val) === '[object Object]'
