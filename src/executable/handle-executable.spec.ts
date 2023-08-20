import {handleExecutable} from "./handle-executable";
import {Executable} from "../types";
import {html} from "../html";

describe("handleExecutable", () => {
	let div: HTMLDivElement;
	const refs = {}
	
	beforeEach(() => {
		div = document.createElement("div");
	})
	
	it('should handle event executable', () => {
		const fnMock1 = jest.fn();
		const fnMock2 = jest.fn();
		
		const e: Executable = {
			node: div,
			values: [
				{
					type: "event",
					name: "scroll",
					rawValue: "{{val0}}, true",
					value: "{{val0}}",
					renderedNode: div,
					parts: [fnMock1]
				}
			],
			subExecutables: []
		}
		
		handleExecutable(e, refs);
		
		expect(e).toEqual({
			"node": div,
			"subExecutables": [],
			"values": [{
				"name": "scroll",
				"rawValue": "{{val0}}, true",
				"renderedNode": div,
				"type": "event",
				"value": fnMock1,
				"parts": [fnMock1]
			}]
		})
		
		e.values[0].parts = [fnMock2]
		handleExecutable(e, refs);
		
		expect(e).toEqual({
			"node": div,
			"subExecutables": [],
			"values": [{
				"name": "scroll",
				"rawValue": "{{val0}}, true",
				"renderedNode": div,
				"type": "event",
				"value": fnMock2,
				"parts": [fnMock2]
			}]
		})
		
		expect(div.outerHTML).toBe('<div></div>')
		
		e.values[0].parts = [null]
		expect(() => handleExecutable(e, refs)).toThrowError('handler for event "scroll" is not a function. Found "null".')
	});
	
	it('should handle event sub-executable', () => {
		const fnMock1 = jest.fn();
		
		const p = document.createElement("p")
		
		const e: Executable = {
			node: div,
			values: [],
			subExecutables: [
				{
					node: p,
					values: [
						{
							type: "event",
							name: "click",
							rawValue: "{{val0}}",
							value: "{{val0}}",
							renderedNode: p,
							parts: [fnMock1]
						}
					],
					subExecutables: []
				}
			]
		}
		
		handleExecutable(e, refs);
		
		expect(e).toEqual({
			"node": div,
			"subExecutables": [
				{
					"node": p,
					"subExecutables": [],
					"values": [
						{
							"name": "click",
							"rawValue": "{{val0}}",
							"renderedNode": p,
							"type": "event",
							"value": fnMock1,
							"parts": [fnMock1]
						}
					]
				}
			],
			"values": []
		})
	});
	
	it('should handle attribute value executable', () => {
		const e: Executable = {
			node: div,
			values: [
				{
					type: "attr-value",
					name: "id",
					rawValue: "{{val0}}",
					value: "{{val0}}",
					renderedNode: div,
					parts: ["sample"]
				}
			],
			subExecutables: []
		}
		
		handleExecutable(e, refs);
		
		expect(e).toEqual({
			"node": div,
			"subExecutables": [],
			"values": [
				{
					"name": "id",
					"rawValue": "{{val0}}",
					"renderedNode": div,
					"type": "attr-value",
					"value": "sample",
					"parts": ["sample"]
				}
			]
		})
		
		expect(div.outerHTML).toBe('<div id="sample"></div>')
	});
	
	it('should handle attribute directive executable', () => {
		const e: Executable = {
			node: div,
			values: [
				{
					type: "attr-dir",
					name: "attr",
					rawValue: "true",
					value: "",
					renderedNode: div,
					prop: "disabled",
					parts: [true]
				}
			],
			subExecutables: []
		}
		
		handleExecutable(e, refs);
		
		expect(e).toEqual({
			"node": div,
			"subExecutables": [],
			"values": [
				{
					"name": "attr",
					"prop": "disabled",
					"rawValue": "true",
					"renderedNode": div,
					"type": "attr-dir",
					"value": true,
					"parts": [true]
				}
			]
		})
		
		expect(div.outerHTML).toBe('<div disabled=""></div>')
	});
	
	it('should handle text executable as text', () => {
		const txt = document.createTextNode("{{val0}}");
		div.appendChild(txt);
		
		const e: Executable = {
			node: txt,
			values: [
				{
					type: "text",
					name: "nodeValue",
					rawValue: "{{val0}}",
					value: "",
					renderedNode: txt,
					parts: ["sample"]
				}
			],
			subExecutables: []
		}
		
		handleExecutable(e, refs);
		
		expect(div.outerHTML).toBe('<div>sample</div>')
	});
	
	it('should handle text executable as node', () => {
		const txt = document.createTextNode("{{val0}}");
		div.appendChild(txt);
		
		const p = document.createElement("p");
		
		const e: Executable = {
			node: txt,
			values: [
				{
					type: "text",
					name: "nodeValue",
					rawValue: "{{val0}}",
					value: "",
					renderedNode: txt,
					parts: [p]
				}
			],
			subExecutables: []
		}
		
		handleExecutable(e, refs);
		
		expect(div.outerHTML).toBe('<div><p></p></div>')
	});
	
	it('should handle text executable as node', () => {
		const txt = document.createTextNode("{{val0}}");
		div.appendChild(txt);
		
		const p = html`<p>sample</p>`;
		
		const e: Executable = {
			node: txt,
			values: [
				{
					type: "text",
					name: "nodeValue",
					rawValue: "{{val0}}",
					value: "",
					renderedNode: txt,
					parts: [p]
				}
			],
			subExecutables: []
		}
		
		handleExecutable(e, refs);
		
		expect(div.outerHTML).toBe('<div><p>sample</p></div>')
	});
	
	it('should handle html string executable as text and encode entities', () => {
		const txt = document.createTextNode("{{val0}}");
		div.appendChild(txt);
		
		const e: Executable = {
			node: txt,
			values: [
				{
					type: "text",
					name: "nodeValue",
					rawValue: "{{val0}}",
					value: "",
					renderedNode: txt,
					parts: ['<p>sample</p>']
				}
			],
			subExecutables: []
		}
		
		handleExecutable(e, refs);
		
		expect(div.outerHTML).toBe('<div>&lt;p&gt;sample&lt;/p&gt;</div>')
	});
})
