import {Executable} from "../types";
import {extractExecutableValueFromRawValue} from "./extract-executable-value-from-raw-value";

export const collectExecutables = (node: Node, nodeValues: unknown[], refs: Record<string, Set<Element>>) => {
	const comp = customElements.get(node.nodeName.toLowerCase());
	const executable: Executable = {
		directives: [],
		attributes: [],
		events: [],
		content: [],
	}
	
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
				if (comp) {
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
				executable.events.push({
					...details,
					prop: attr.name.slice(2),
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
					executable.directives.push({
						...details,
						name: attr.name.slice(0, attr.name.indexOf(".")),
						value: "",
						prop
					})
				}
			} else if (/{{val[0-9]+}}/.test(attr.value)) {
				executable.attributes.push(details)
			}
		}
	} else if (node.nodeType === 3) {
		if (/{{val[0-9]+}}/.test(node.nodeValue || "")) {
			executable.content.push({
				name: "nodeValue",
				rawValue: node.nodeValue ?? "",
				value: node.nodeValue,
				parts: extractExecutableValueFromRawValue(node.nodeValue ?? "", nodeValues),
				renderedNode: node,
			});
		}
	}
	
	return executable;
}
