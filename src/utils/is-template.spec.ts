import {isTemplate} from "./is-template";
import {html} from "../html";

describe("isTemplate", () => {
	it("should be false", () => {
		expect(isTemplate("str")).toBeFalsy();
		expect(isTemplate(12)).toBeFalsy();
		expect(isTemplate(true)).toBeFalsy();
		expect(isTemplate(Symbol(""))).toBeFalsy();
		expect(isTemplate(+12)).toBeFalsy();
		expect(isTemplate(null)).toBeFalsy();
		expect(isTemplate(undefined)).toBeFalsy();
		expect(isTemplate([])).toBeFalsy();
		expect(isTemplate(new Set())).toBeFalsy();
		expect(isTemplate(new Map())).toBeFalsy();
	})
	
	it("should be valid", () => {
		expect(isTemplate(html`sample`)).toBeTruthy();
		expect(isTemplate(new (class Temp {})())).toBeTruthy();
	})
})
