import {Executable, ExecutableValue} from "../types";
import {jsonParse, isObjectLiteral, isPrimitive, jsonStringify, turnKebabToCamelCasing} from "../utils";
import {handleTextExecutable} from "./handle-text-executable";
import {handleAttrDirectiveExecutable} from "./handle-attr-directive-executable";
import {HtmlTemplate} from "../html";

export const handleExecutable = (executable: Executable, refs: Record<string, Set<Element>>) => {
	
	if (executable.subExecutables.length) {
		executable.subExecutables.forEach(executable => {
			handleExecutable(executable, refs);
		})
	}
	
	for (let val of executable.values) {
		switch (val.type) {
			case "attr-dir":
				handleAttrDirectiveExecutableValue(val)
				break;
			case "attr-value":
				handleAttrExecutableValue(val, executable.node as Element);
				break;
			case "event":
				handleEventExecutableValue(val);
				break;
			case "text":
				// console.log('-- handleExecutable => handleTextExecutableValue');
				handleTextExecutableValue(val, refs)
				break;
		}
	}
}

export function handleAttrDirectiveExecutableValue(val: ExecutableValue) {
	const value = jsonParse(val.parts.map(p => typeof p === "function" ? p() : p).join(""));
	
	if (val.value !== value) {
		handleAttrDirectiveExecutable(val, value);
	}
}

export function handleEventExecutableValue(val: ExecutableValue) {
	const eventHandler = val.parts[0] as EventListenerOrEventListenerObject;
	
	if (typeof eventHandler !== "function") {
		throw new Error(`handler for event "${val.name}" is not a function. Found "${eventHandler}".`)
	}
	
	if (val.value !== eventHandler) {
		val.value = eventHandler;
		const node = Array.isArray(val.renderedNode)
			? (val.renderedNode as Node[])[0]
			: val.renderedNode as Node;
		const eventName = val.prop as string;
		const option = val.parts.length > 1
			? val.parts[2]
			: jsonParse(val.rawValue.split(',')[1]);
		const validOption = typeof option === "boolean" || isObjectLiteral(option);
		const eventOption = validOption ? option : undefined;
		
		if (typeof val.value === "function") {
			node.removeEventListener(eventName, eventHandler, eventOption)
		}
		
		node.addEventListener(eventName, eventHandler, eventOption)
	}
}

export function handleAttrExecutableValue(val: ExecutableValue, node: Element) {
	const value = val.parts.length > 1
		? jsonParse(val.parts.map(p => typeof p === "function" ? p() : jsonStringify(p)).join(''))
		: jsonParse(typeof val.parts[0] === "function" ? val.parts[0]() : val.parts[0] as string)
	
	if (value !== val.value) {
		val.value = value;
		
		// always update the element attribute
		node.setAttribute(val.name, jsonStringify(value));
		
		// if the node name includes a dash it is a web component
		// and for WC we can also use the setter to set the value in case they
		// have correspondent camel case property version of the attribute
		if (node.nodeName.includes("-") && !isPrimitive(value)) {
			const comp = node as Record<string, any>;
			const propName = turnKebabToCamelCasing(val.name);
			const descriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(comp));
			
			// make sure the property can be set
			if (descriptors.hasOwnProperty(propName) && typeof descriptors[propName].set === "function") {
				comp[propName] = value;
			}
		}
	}
}

export function handleTextExecutableValue(val: ExecutableValue, refs: Record<string, Set<Element>>) {
	
	const value = val.parts.flatMap(p => typeof p === "function" ? p() : p);
	
	const nodes: Array<Node> = [];
	
	(value as Array<Node | HtmlTemplate | string>).forEach((v: Node | HtmlTemplate | string, idx) => {
		if (v instanceof HtmlTemplate) {
			const renderedBefore = v.renderTarget !== null;
			
			if (renderedBefore) {
				v.update();
			} else {
				v.render(document.createElement("div"));
			}
			
			// collect dynamic refs that could appear
			// after render/update
			Object.entries(v.refs).forEach(([name, els]) => {
				els.forEach(el => {
					if (!refs[name]) {
						refs[name] = new Set();
					}
					
					refs[name].add(el)
				});
			})
			
			nodes.push(...v.nodes);
		} else if (v instanceof Node) {
			nodes.push(v)
		} else {
			// need to make sure to grab the same text node that was already rendered
			// to avoid unnecessary DOM updates
			if (Array.isArray(val.value) && Array.isArray(val.renderedNode) && String(val.value[idx]) === String(v)) {
				nodes.push(val.renderedNode[idx])
			} else {
				nodes.push(document.createTextNode(String(v)))
			}
		}
	})
	
	val.value = value;
	
	// need to make sure nodes array does not have repeated nodes
	// which cannot be rendered in 2 places at once
	handleTextExecutable(val, Array.from(new Set(nodes)));
}
