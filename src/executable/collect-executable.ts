import {Executable, ExecutableValue} from "../types";
import {extractExecutableValueFromRawValue} from "./extract-executable-value-from-raw-value";
import {handleTextExecutableValue} from "./handle-executable";

export const collectExecutables = (node: Node, nodeValues: unknown[], refs: Record<string, Set<Element>>, cb: (executable: Executable) => void) => {
	const values: Executable['values'] = [];
	const isWC = node.nodeName.includes('-');
	
	if (node.nodeType === 1) {
		const element = node as Element;
		
		for (const attr of Array.from(element.attributes)) {
			const details = {
				name: attr.name,
				rawValue: attr.value,
				value: attr.value,
				renderedNode: node,
				parts: extractExecutableValueFromRawValue(attr.value || "", nodeValues)
			};
			
			if (/^on[a-z]+/.test(attr.name)) {
				// if the node happen to have
				if (isWC) {
					const comp = customElements.get(element.nodeName.toLowerCase());
					
					// @ts-ignore
					if (comp?.observedAttributes?.includes(attr.name)) {
						continue;
					}
					// @ts-ignore
				} else if (document.head && typeof document.head[attr.name] === 'undefined') {
					// ignore unknown events
					continue;
				}
				
				element.removeAttribute(attr.name);
				values.push({
					...details,
					prop: attr.name.slice(2),
					type: "event",
				})
			} else if (/^(attr|ref)/.test(attr.name)) {
				element.removeAttribute(attr.name);
				
				if (attr.name === "ref") {
					if (!refs[attr.value]) {
						refs[attr.value] = new Set()
					}
					
					refs[attr.value].add(node as Element)
				} else {
					const isAttrOrBind = attr.name.match(/(attr)\.([a-z0-9-.]+)/);
					const prop = isAttrOrBind ? isAttrOrBind[2] : "";
					values.push({
						...details,
						type: "attr-dir",
						name: attr.name.slice(0, attr.name.indexOf(".")),
						value: "",
						prop
					})
				}
			} else if (/{{val[0-9]+}}/.test(attr.value)) {
				values.push({
					...details,
					type: "attr-value"
				})
			}
		}
	} else if (node.nodeType === 3) {
		if (/{{val[0-9]+}}/.test(node.nodeValue || "")) {
			const v = {
				type: "text",
				name: "nodeValue",
				rawValue: node.nodeValue ?? "",
				value: node.nodeValue,
				renderedNode: node,
				parts: extractExecutableValueFromRawValue(node.nodeValue ?? "", nodeValues)
			} as ExecutableValue;
			values.push(v);
			handleTextExecutableValue(v, refs);
		}
	}
	
	if (values.length) {
		cb({
			node,
			values,
			subExecutables: []
		})
	}
}
