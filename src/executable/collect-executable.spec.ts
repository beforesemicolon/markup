import {collectExecutables} from "./collect-executable";

describe("collectExecutables", () => {
	let refs: Record<string, Set<Element>> = {};
	const defaultExec = {
		directives: [],
		content: [],
		attributes: [],
		events: [],
	}
	
	beforeEach(() => {
		refs = {};
		jest.clearAllMocks()
	})
	
	it('should collect event executable', () => {
		const onClickHandler = () => null;
		const btn = document.createElement('button');
		
		btn.setAttribute("onclick", `${onClickHandler}`);
		
		expect(btn.outerHTML).toBe('<button onclick="() => null"></button>')
		
		const res = collectExecutables(btn, [], refs);
		
		expect(res).toEqual({
			...defaultExec,
			"events": [{
				"name": "onclick",
				"prop": "click",
				"rawValue": "() => null",
				"renderedNode": btn,
				"value": "() => null",
				"parts": ["() => null"]
			}]
		})
		
		expect(btn.outerHTML).toBe('<button></button>')
	});
	
	it('should collect attribute value executable', () => {
		const btn = document.createElement('button');
		
		btn.setAttribute("disabled", "{{val0}}");
		
		expect(btn.outerHTML).toBe('<button disabled="{{val0}}"></button>')
		
		const res = collectExecutables(btn, [12], refs);
		
		expect(res).toEqual({
			...defaultExec,
			"attributes": [{
				"name": "disabled",
				"rawValue": "{{val0}}",
				"renderedNode": btn,
				"value": "{{val0}}",
				"parts": [12]
			}]
		})
		
		expect(btn.outerHTML).toBe('<button disabled="{{val0}}"></button>')
	});
	
	it('should collect attribute directive executable', () => {
		const btn = document.createElement('button');
		
		btn.setAttribute("attr.disabled", "{{val0}}");
		
		expect(btn.outerHTML).toBe('<button attr.disabled="{{val0}}"></button>')
		
		const res = collectExecutables(btn, [12], refs);
		
		expect(res).toEqual({
			...defaultExec,
			"directives": [{
				"name": "attr",
				"prop": "disabled",
				"rawValue": "{{val0}}",
				"renderedNode": btn,
				"value": "",
				"parts": [12]
			}]
		})
		
		expect(btn.outerHTML).toBe('<button></button>')
	});
	
	it('should collect ref directive executable', () => {
		const btn = document.createElement('button');
		
		btn.setAttribute("ref", "btn");
		
		expect(btn.outerHTML).toBe('<button ref="btn"></button>')
		
		const res = collectExecutables(btn, [], refs);
		
		expect(refs['btn']).toBeDefined()
		
		expect(btn.outerHTML).toBe('<button></button>')
	});
	
	it('should collect text executable', () => {
		const txt = document.createTextNode('{{val0}}');
		
		expect(txt.nodeValue).toBe('{{val0}}')
		
		const res = collectExecutables(txt, [12], refs);
		
		expect(res).toEqual({
			...defaultExec,
			"content": [{
				"name": "nodeValue",
				"rawValue": "{{val0}}",
				"renderedNode": expect.any(Object),
				"value": "{{val0}}",
				"parts": [12]
			}]
		})
	});
})
