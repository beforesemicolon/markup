import {Executable, Template} from "./types";
import {collectExecutables} from "./executable/collect-executable";
import {handleExecutable} from "./executable/handle-executable";
import {isTemplate} from "./utils/is-template";

class Temp implements Template {
	#htmlTemplate: string;
	#nodes: Node[] = [];
	#renderTarget: HTMLElement | ShadowRoot | null = null;
	#executable: Executable;
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
				if(isTemplate(v)) {
					return {...acc, ...(v as Template).refs}
				}
				
				return acc;
			}, {} as Record<string, Element>)),
			...this.#refs
		})
	}
	
	constructor(parts: TemplateStringsArray, private values: unknown[]) {
		const frag = document.createDocumentFragment();
		const el = document.createElement("div");
		this.#htmlTemplate= parts.map((s, i) => {
			return i == parts.length - 1 ? s : s + `{{val${i}}}`;
		}).join("").trim();
		el.innerHTML = this.htmlTemplate;
		Array.from(el.childNodes).forEach(n => {
			frag.appendChild(n);
			this.#nodes.push(n)
		});
		const self = this;
		
		this.#executable = (function traverse(n: HTMLElement | DocumentFragment, ancestorExecutable: Executable) {
			Array.from(n.childNodes, c => {
				let cn: Executable | null = null;
				
				collectExecutables(c, executable => {
					cn = executable;
					ancestorExecutable.subExecutables.push(executable);
					self.#nodeByExecutable.set(c, executable);
				}, (refName: string) => {
					self.#refs[refName] = c as HTMLElement;
				});
				
				if (c.nodeType === 1) {
					traverse(c as HTMLElement, cn ?? ancestorExecutable)
				}
			});
			
			return ancestorExecutable;
		})(frag, {node: frag, values: [], subExecutables: []});
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
				handleExecutable(executable, this.values);
			});
		}
	}
}


/**
 * html template literal tag function
 * @param parts
 * @param values
 */
export const html = (parts: TemplateStringsArray, ...values: unknown[]): Template => {
	return new Temp(parts, values)
}
