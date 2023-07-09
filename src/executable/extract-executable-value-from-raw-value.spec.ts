import {extractExecutableValueFromRawValue} from "./extract-executable-value-from-raw-value";

describe("extractExecutableValueFromRawValue", () => {
	it('should return raw value if no placeholder preset', () => {
		expect(extractExecutableValueFromRawValue(
			"just a simple straight up text", [12, 45]
		)).toEqual(["just a simple straight up text"])
	});
	
	it('should collect single value', () => {
		expect(extractExecutableValueFromRawValue(
			"{{val0}}", [12, 45]
		)).toEqual([12])
	});
	
	it('should collect single value mixed with other content', () => {
		expect(extractExecutableValueFromRawValue(
			"{{val0}} in between {{val1}}", [12, 24, 36]
		)).toEqual([
			12,
			" in between ",
			24
		]);
	});
	
	it('should collect multiple values', () => {
		expect(extractExecutableValueFromRawValue(
			"{{val0}} {{val1}}", [12, 24, 36]
		)).toEqual([12, " ", 24])
	});
	
	it('should collect multiple values mixed with other content', () => {
		expect(extractExecutableValueFromRawValue(
			"heading {{val0}} middle {{val1}} tail text", [12, 24, 36]
		)).toEqual([
			"heading ",
			12,
			" middle ",
			24,
			" tail text"
		])
	});
})
