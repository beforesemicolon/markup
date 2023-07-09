import {isObjectLiteral} from "./is-object-literal";

describe("isObjectLiteral", () => {
	it('should be object', () => {
		expect(isObjectLiteral({})).toBeTruthy()
		expect(isObjectLiteral(new Object({}))).toBeTruthy()
	});
	
	it('should NOT be object', () => {
		expect(isObjectLiteral(Object.create(null))).toBeFalsy()
		expect(isObjectLiteral(new Map())).toBeFalsy()
		expect(isObjectLiteral(new Set())).toBeFalsy()
		expect(isObjectLiteral(String(""))).toBeFalsy()
		expect(isObjectLiteral(Number(1))).toBeFalsy()
		expect(isObjectLiteral(Array())).toBeFalsy()
		expect(isObjectLiteral(new Function())).toBeFalsy()
		expect(isObjectLiteral(Symbol())).toBeFalsy()
	});
})
