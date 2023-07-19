import {Executable} from "../types";
import {extractExecutableValueFromRawValue} from "./extract-executable-value-from-raw-value";

export const collectExecutables = (node: Node, nodeValues: unknown[], cb: (executable: Executable) => void, refCb: (refName: string) => void) => {
	const values: Executable['values'] = [];
	
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
				element.removeAttribute(attr.name);
				values.push({
					...details,
					prop: attr.name.slice(2),
					type: "event",
				})
			} else if (/^(attr|ref)/.test(attr.name)) {
				element.removeAttribute(attr.name);
				
				if (attr.name === "ref") {
					refCb(attr.value)
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
			values.push({
				type: "text",
				name: "nodeValue",
				rawValue: node.nodeValue ?? "",
				value: node.nodeValue,
				renderedNode: node,
				parts: extractExecutableValueFromRawValue(node.nodeValue ?? "", nodeValues)
			});
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
