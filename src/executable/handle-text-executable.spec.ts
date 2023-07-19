import {handleTextExecutable} from "./handle-text-executable";
import {ExecutableValue} from "../types";

describe("handleTextExecutable", () => {
	it('should remove one node', () => {
		const div = document.createElement("div");
		const txt = document.createTextNode("{{val0}}");
		
		div.appendChild(txt);
		
		expect(div.innerHTML).toBe('{{val0}}');
		expect(txt.nodeValue).toBe('{{val0}}');
		expect(txt.parentNode).toEqual(div);
		
		const execVal: ExecutableValue = {
			type: "text",
			name: "nodeValue",
			rawValue: "",
			value: "",
			renderedNode: txt,
			parts: []
		};
		
		expect(execVal.renderedNode).toEqual(txt)
		
		handleTextExecutable(execVal, []);
		
		expect(div.innerHTML).toBe('');
		expect(txt.nodeValue).toBe('{{val0}}');
		expect(txt.parentNode).toBeNull();
		expect(execVal.renderedNode).not.toEqual(txt)
	});
	
	it('should remove all nodes', () => {
		const div = document.createElement("div");
		div.innerHTML = "<span>sample</span><span>text</span>";
		
		expect(div.innerHTML).toBe('<span>sample</span><span>text</span>');
		
		const execVal: ExecutableValue = {
			type: "text",
			name: "nodeValue",
			rawValue: "",
			value: "",
			renderedNode: Array.from(div.childNodes),
			parts: []
		};
		
		handleTextExecutable(execVal, []);
		
		expect(div.innerHTML).toBe('');
		expect(execVal.renderedNode).toBeInstanceOf(Text);
	});
	
	it('should replace all nodes with new ones', () => {
		const div = document.createElement("div");
		div.innerHTML = "<span>sample</span><span>text</span>";
		
		expect(div.innerHTML).toBe('<span>sample</span><span>text</span>');
		
		const execVal: ExecutableValue = {
			type: "text",
			name: "nodeValue",
			rawValue: "",
			value: "",
			renderedNode: Array.from(div.childNodes),
			parts: []
		};
		
		const p1 = document.createElement("p");
		const p2 = document.createElement("p");
		
		p1.innerHTML = "one";
		p2.innerHTML = "two";
		
		const nodes = [p1, p2];
		
		handleTextExecutable(execVal, nodes);
		
		expect(div.innerHTML).toBe('<p>one</p><p>two</p>');
		expect(execVal.renderedNode).toEqual(nodes);
	});
	
	it('should replace some nodes with new ones', () => {
		const div = document.createElement("div");
		
		const p1 = document.createElement("p");
		const p2 = document.createElement("p");
		const p3 = document.createElement("p");
		const p4 = document.createElement("p");
		
		p1.innerHTML = "one";
		p2.innerHTML = "two";
		p3.innerHTML = "three";
		p4.innerHTML = "four";
		
		const nodes = [p1, p3];
		
		div.appendChild(p2)
		div.appendChild(p4)
		
		expect(div.innerHTML).toBe('<p>two</p><p>four</p>');
		
		const execVal: ExecutableValue = {
			type: "text",
			name: "nodeValue",
			rawValue: "",
			value: "",
			renderedNode: Array.from(div.childNodes),
			parts: []
		};
		
		handleTextExecutable(execVal, nodes);
		
		expect(div.innerHTML).toBe('<p>one</p><p>three</p>');
		expect(execVal.renderedNode).toEqual(nodes);
	});
	
	it('should replace one node with new ones', () => {
		const div = document.createElement("div");
		
		const p1 = document.createElement("p");
		const p2 = document.createElement("p");
		const p3 = document.createElement("p");
		
		p1.innerHTML = "one";
		p2.innerHTML = "two";
		p3.innerHTML = "three";
		
		div.appendChild(p1)
		
		expect(div.innerHTML).toBe('<p>one</p>');
		
		const execVal: ExecutableValue = {
			type: "text",
			name: "nodeValue",
			rawValue: "",
			value: "",
			renderedNode: p1,
			parts: []
		};
		
		handleTextExecutable(execVal, [p2, p3]);
		
		expect(div.innerHTML).toBe('<p>two</p><p>three</p>');
		expect(execVal.renderedNode).toEqual([p2, p3]);
	});
})
