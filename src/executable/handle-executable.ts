import {Executable} from "../types";
import {jsonParse, isObjectLiteral, isPrimitive, jsonStringify, turnKebabToCamelCasing} from "../utils";
import {handleTextExecutable} from "./handle-text-executable";
import {handleAttrDirectiveExecutable} from "./handle-attr-directive-executable";
import {HtmlTemplate} from "../html";

export const handleExecutable = (executable: Executable) => {
	
	if (executable.subExecutables.length) {
		executable.subExecutables.forEach(executable => {
			handleExecutable(executable);
		})
	}
	
	for (let val of executable.values) {
		let value: any = "";
		
		switch (val.type) {
			case "attr-dir":
				value = jsonParse(val.parts.map(p => typeof p === "function" ? p() : p).join(""));
				handleAttrDirectiveExecutable(val, value);
				break;
			case "event":
				let node = Array.isArray(val.renderedNode)
					? (val.renderedNode as Node[])[0]
					: val.renderedNode as Node;
				const eventHandler = val.parts[0] as EventListenerOrEventListenerObject;
				const eventName = val.prop as string;
				const option = val.parts.length > 1
					? val.parts[2]
					: jsonParse(val.rawValue.split(',')[1]);
				
				if (typeof eventHandler !== "function") {
					throw new Error(`handler for event "${val.name}" is not a function. Found "${eventHandler}".`)
				}
				
				if (val.value !== eventHandler) {
					val.value = eventHandler;
					const validOption = typeof option === "boolean" || isObjectLiteral(option);
					const eventOption = validOption ? option : undefined;
					
					if (typeof val.value === "function") {
						node.removeEventListener(eventName, eventHandler, eventOption)
					}
					
					node.addEventListener(eventName, eventHandler, eventOption)
				}
				break;
			case "attr-value":
				const isWC = executable.node.nodeName.includes("-")
				value = val.parts.length > 1
					? jsonParse(val.parts.map(p => typeof p === "function" ? p() : jsonStringify(p)).join(''))
					: jsonParse(typeof val.parts[0] === "function" ? val.parts[0]() : val.parts[0] as string)
				
				if (value !== val.value) {
					val.value = value;
					
					(executable.node as Element).setAttribute(val.name, jsonStringify(value));
					
					if (isWC && !isPrimitive(value)) {
						const comp = executable.node as Record<string, any>;
						const propName = turnKebabToCamelCasing(val.name);
						
						const descriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(comp));
						
						// make sure the property can be set
						if (descriptors.hasOwnProperty(propName) && typeof descriptors[propName].set === "function") {
							comp[propName] = value;
						}
					}
				}
				
				break;
			case "text":
				value = val.parts.flatMap(p => typeof p === "function" ? p() : p);
				
				val.value = value;
				
				const div = document.createElement("div");
				const nodes: Array<Node> = [];
				
				value.forEach((v: Node | HtmlTemplate | string) => {
					if (v instanceof HtmlTemplate) {
						const renderedBefore = v.renderTarget !== null;
						
						if (renderedBefore) {
							v.update();
						} else {
							v.render(div);
						}
						
						nodes.push(...v.nodes);
						div.innerHTML = "";
					} else if (v instanceof Node) {
						nodes.push(v)
					} else {
						nodes.push(document.createTextNode(String(v)))
					}
				})
				
				handleTextExecutable(val, Array.from(nodes));
				
				break;
		}
	}
}
