import {Executable} from "./types";
import {collectExecutables} from "./executable/collect-executable";
import {handleExecutable} from "./executable/handle-executable";
import {parse} from "@beforesemicolon/html-parser";

export class HtmlTemplate {
	#htmlTemplate: string;
	#nodes: Node[] = [];
	#renderTarget: HTMLElement | ShadowRoot | null = null;
	#executable: Executable = {node: document.createDocumentFragment(), values: [], subExecutables: []};
	#refs: Record<string, Element> = {};
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
	get refs(): Record<string, Element> {
		return Object.freeze({
			...(this.values.reduce((acc: Record<string, Element>, v) => {
				if(v instanceof HtmlTemplate) {
					return {...acc, ...v.refs}
				}
				
				return acc;
			}, {} as Record<string, Element>)),
			...this.#refs
		})
	}
	
	constructor(parts: TemplateStringsArray, private values: unknown[]) {
		this.#htmlTemplate = parts.map((s, i) => {
			return i == parts.length - 1 ? s : s + `{{val${i}}}`;
		}).join("").trim();
		
		this.#executable.node = parse(this.#htmlTemplate, (node: Node) => {
			collectExecutables(node, values, executable => {
				this.#executable.subExecutables.push(executable);
				this.#nodeByExecutable.set(node, executable);
			}, (refName: string) => {
				this.#refs[refName] = node as HTMLElement;
			});
		});
		
		this.#nodes = Array.from(this.#executable.node.childNodes);
	}
	
	/**
	 * renders the template on the provided HTMLElement or ShadowRoot instance
	 * @param elementToAttachNodesTo
	 * @param force
	 */
	render = (elementToAttachNodesTo: ShadowRoot | HTMLElement, force = false) => {
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
	 * updates the already rendered DOM Nodes with the update values
	 */
	update() {
		if (this.renderTarget) {
			this.#executable.subExecutables.forEach(executable => {
				handleExecutable(executable);
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
