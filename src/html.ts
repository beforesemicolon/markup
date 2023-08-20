import {Executable} from "./types";
import {collectExecutables} from "./executable/collect-executable";
import {handleExecutable} from "./executable/handle-executable";
import {parse} from "@beforesemicolon/html-parser";

export class HtmlTemplate {
	#htmlTemplate: string;
	#nodes: Node[] = [];
	#renderTarget: HTMLElement | ShadowRoot | Element | null = null;
	#executable: Executable = {node: document.createDocumentFragment(), values: [], subExecutables: []};
	#refs: Record<string, Set<Element>> = {};
	#nodeByExecutable: WeakMap<Node, Executable> = new WeakMap();
	
	/**
	 * template string representation
	 */
	get htmlTemplate() {
		return this.#htmlTemplate;
	}
	
	/**
	 * list of direct ChildNode from the template that got rendered
	 */
	get nodes() {
		return this.#nodes.flatMap(n => {
			const e = this.#nodeByExecutable.get(n);
			
			if (e) {
				return e.values.flatMap(v => Array.isArray(v.renderedNode) ? v.renderedNode : [v.renderedNode]);
			}
			
			return [n];
		})
	}
	
	/**
	 * the HTMLElement or ShadowRoot instance provided in the render method
	 */
	get renderTarget() {
		return this.#renderTarget;
	}
	
	/**
	 * map of DOM element references keyed by the name provided as the ref attribute value
	 */
	get refs(): Record<string, Array<Element>> {
		const valueRefs = this.values.reduce((acc: Record<string, Array<Element>>, v) => {
			if(v instanceof HtmlTemplate) {
				return {...acc, ...v.refs}
			}
			
			return acc;
		}, {} as Record<string, Array<Element>>)
		
		return Object.freeze({
			...valueRefs,
			...Object.entries(this.#refs).reduce((acc, [key, set]) => ({
				...acc,
				[key]: [...Array.from(set), ...(valueRefs[key] ?? [])]
			}), {})
		});
	}
	
	constructor(parts: TemplateStringsArray, private values: unknown[]) {
		this.#htmlTemplate = parts.map((s, i) => {
			return i == parts.length - 1 ? s : s + `{{val${i}}}`;
		}).join("").trim();
		
		this.#executable.node = parse(this.#htmlTemplate, (node: Node) => {
			collectExecutables(node, values, this.#refs, executable => {
				this.#executable.subExecutables.push(executable);
				this.#nodeByExecutable.set(node, executable);
			});
		});
		
		this.#nodes = Array.from(this.#executable.node.childNodes);
	}
	
	/**
	 * appends the template on the provided HTMLElement or ShadowRoot instance
	 * @param elementToAttachNodesTo
	 * @param force
	 */
	render = (elementToAttachNodesTo: ShadowRoot | HTMLElement | Element, force = false) => {
		if (elementToAttachNodesTo && elementToAttachNodesTo !== this.renderTarget && (force || !this.renderTarget) && (
			elementToAttachNodesTo instanceof ShadowRoot ||
			elementToAttachNodesTo instanceof HTMLElement
		)) {
			this.#renderTarget = elementToAttachNodesTo;
			this.nodes.forEach(node => {
				if (node.parentNode !== elementToAttachNodesTo) {
					elementToAttachNodesTo.appendChild(node)
				}
			})
			
			this.update();
		}
	}
	
	/**
	 * replaces the target element with the template nodes. Does not replace HEAD, BODY, HTML, and ShadowRoot elements
	 * @param target
	 */
	replace = (target: Node | HTMLElement | Element | HtmlTemplate) => {
		if (target instanceof HtmlTemplate ||
			(
				target instanceof HTMLElement &&
				!(
					target instanceof ShadowRoot ||
					target instanceof HTMLBodyElement ||
					target instanceof HTMLHeadElement ||
					target instanceof HTMLHtmlElement
				)
			)
		) {
			let element: HTMLElement  = target as HTMLElement;
			
			if (target instanceof HtmlTemplate) {
				const renderedNode = target.nodes.find(n => n instanceof HTMLElement && n.isConnected) as HTMLElement;
				
				if (renderedNode) {
					element = renderedNode;
					
					target.nodes.forEach(n => {
						if (n !== renderedNode && n.isConnected) {
							n.parentNode?.removeChild(n);
						}
					})
				} else {
					return;
				}
			}
			
			// only try to replace elements that are actually rendered anywhere
			if (!element.isConnected) {
			    return;
			}
			
			const getFrag = () => {
				const frag = document.createDocumentFragment();
				frag.append(...this.nodes)
				
				return frag;
			}
			
			if (typeof element.replaceWith === "function") {
				element.replaceWith(getFrag());
			} else if(element.parentNode) {
				element.parentNode.replaceChild(getFrag(), element);
			} else {
				return;
			}
			
			this.#renderTarget = element;
			this.update();
			return;
		}
		
		throw new Error(`Invalid replace target element. Received ${target}`)
	}
	
	/**
	 * updates the already rendered DOM Nodes with the update values
	 */
	update() {
		if (this.renderTarget) {
			this.#executable.subExecutables.forEach(executable => {
				handleExecutable(executable, this.#refs);
			});
		}
	}
}


/**
 * html template literal tag function
 * @param parts
 * @param values
 */
export const html = (parts: TemplateStringsArray, ...values: unknown[]) => {
	return new HtmlTemplate(parts, values)
}
