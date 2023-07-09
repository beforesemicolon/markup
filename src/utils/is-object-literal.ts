export const isObjectLiteral = (val: unknown) => val
	&& typeof val === "object"
	&& Object.getPrototypeOf(val) === Object.prototype;
