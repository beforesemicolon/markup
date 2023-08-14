import {collectExecutables} from "./collect-executable";

describe("collectExecutables", () => {
	const cbMock = jest.fn();
	let refs: Record<string, Element> = {};
	
	beforeEach(() => {
		refs = {};
		jest.clearAllMocks()
	})
	
	it('should collect event executable', () => {
		const onClickHandler = () => null;
		const btn = document.createElement('button');
		
		btn.setAttribute("onclick", `${onClickHandler}`);
		
		expect(btn.outerHTML).toBe('<button onclick="() => null"></button>')
		
		collectExecutables(btn, [], refs, cbMock);
		
		expect(cbMock).toHaveBeenCalledWith({
			"node": btn,
			"subExecutables": [],
			"values": [{
				"name": "onclick",
				"prop": "click",
				"rawValue": "() => null",
				"renderedNode": btn,
				"type": "event",
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
		
		collectExecutables(btn, [12], refs, cbMock);
		
		expect(cbMock).toHaveBeenCalledWith({
			"node": btn,
			"subExecutables": [],
			"values": [{
				"name": "disabled",
				"rawValue": "{{val0}}",
				"renderedNode": btn,
				"type": "attr-value",
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
		
		collectExecutables(btn, [12], refs, cbMock);
		
		expect(cbMock).toHaveBeenCalledWith({
			"node": btn,
			"subExecutables": [],
			"values": [{
				"name": "attr",
				"prop": "disabled",
				"rawValue": "{{val0}}",
				"renderedNode": btn,
				"type": "attr-dir",
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
		
		collectExecutables(btn, [], refs, cbMock);
		
		expect(cbMock).not.toHaveBeenCalled()
		expect(refs['btn']).toBeDefined()
		
		expect(btn.outerHTML).toBe('<button></button>')
	});
	
	it('should collect text executable', () => {
		const txt = document.createTextNode('{{val0}}');
		
		expect(txt.nodeValue).toBe('{{val0}}')
		
		collectExecutables(txt, [12], refs, cbMock);
		
		expect(cbMock).toHaveBeenCalledWith({
			"node": txt,
			"subExecutables": [],
			"values": [{
				"name": "nodeValue",
				"rawValue": "{{val0}}",
				"renderedNode": expect.any(Object),
				"type": "text",
				"value": [12],
				"parts": [12]
			}]
		})
	});
})
