import {collectExecutables} from "./collect-executable";

describe("collectExecutables", () => {
	const cbMock = jest.fn();
	const refCbMock = jest.fn();
	
	beforeEach(() => {
		jest.clearAllMocks()
	})
	
	it('should collect event executable', () => {
		const onClickHandler = () => null;
		const btn = document.createElement('button');
		
		btn.setAttribute("onclick", `${onClickHandler}`);
		
		expect(btn.outerHTML).toBe('<button onclick="() => null"></button>')
		
		collectExecutables(btn, [], cbMock, refCbMock);
		
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
		expect(refCbMock).not.toHaveBeenCalled()
		
		expect(btn.outerHTML).toBe('<button></button>')
	});
	
	it('should collect attribute value executable', () => {
		const btn = document.createElement('button');
		
		btn.setAttribute("disabled", "{{val0}}");
		
		expect(btn.outerHTML).toBe('<button disabled="{{val0}}"></button>')
		
		collectExecutables(btn, [12], cbMock, refCbMock);
		
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
		expect(refCbMock).not.toHaveBeenCalled()
		
		expect(btn.outerHTML).toBe('<button disabled="{{val0}}"></button>')
	});
	
	it('should collect attribute directive executable', () => {
		const btn = document.createElement('button');
		
		btn.setAttribute("attr.disabled", "{{val0}}");
		
		expect(btn.outerHTML).toBe('<button attr.disabled="{{val0}}"></button>')
		
		collectExecutables(btn, [12], cbMock, refCbMock);
		
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
		expect(refCbMock).not.toHaveBeenCalled()
		
		expect(btn.outerHTML).toBe('<button></button>')
	});
	
	it('should collect ref directive executable', () => {
		const btn = document.createElement('button');
		
		btn.setAttribute("ref", "btn");
		
		expect(btn.outerHTML).toBe('<button ref="btn"></button>')
		
		collectExecutables(btn, [], cbMock, refCbMock);
		
		expect(cbMock).not.toHaveBeenCalled()
		expect(refCbMock).toHaveBeenCalledWith("btn")
		
		expect(btn.outerHTML).toBe('<button></button>')
	});
	
	it('should collect text executable', () => {
		const txt = document.createTextNode('{{val19}}');
		
		expect(txt.nodeValue).toBe('{{val19}}')
		
		collectExecutables(txt, [], cbMock, refCbMock);
		
		expect(cbMock).toHaveBeenCalledWith({
			"node": txt,
			"subExecutables": [],
			"values": [{
				"name": "nodeValue",
				"rawValue": "{{val19}}",
				"renderedNode": txt,
				"type": "text",
				"value": "{{val19}}",
				"parts": []
			}]
		})
		expect(refCbMock).not.toHaveBeenCalled()
	});
})
