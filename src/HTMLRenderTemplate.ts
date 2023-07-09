import {Executable} from "./executable/type";
import {handleExecutable} from "./executable/handle-executable";
import {collectExecutables} from "./executable/collect-executable";

export class HTMLRenderTemplate {
	htmlTemplate: string;
	nodes: Node[] = [];
	renderTarget: HTMLElement | ShadowRoot | null = null;
	#executable: Executable;
	refs: Map<string, Element> = new Map();
	
	constructor(parts: TemplateStringsArray, public values: unknown[]) {
		const frag = document.createDocumentFragment();
		const el = document.createElement("div");
		this.htmlTemplate = parts.map((s, i) => {
			return i == parts.length - 1 ? s : s + `{{val${i}}}`;
		}).join("").trim();
		el.innerHTML = this.htmlTemplate;
		Array.from(el.childNodes).forEach(n => {
			frag.appendChild(n);
			this.nodes.push(n)
		});
		const self = this;
		
		this.#executable = (function traverse(n: HTMLElement | DocumentFragment, ancestorExecutable: Executable) {
			Array.from(n.childNodes, c => {
				let cn: Executable | null = null;
				
				collectExecutables(c, executable => {
					cn = executable;
					ancestorExecutable.subExecutables.push(executable);
				}, (refName: string) => {
					self.refs.set(refName, c as HTMLElement)
				});
				
				if (c.nodeType === 1) {
					traverse(c as HTMLElement, cn ?? ancestorExecutable)
				}
			});
			
			return ancestorExecutable;
		})(frag, {node: frag, values: [], subExecutables: []});
	}
	
	render = (elementToAttachNodesTo?: ShadowRoot | HTMLElement, force = false) => {
		if (elementToAttachNodesTo && (force || !this.renderTarget) && (
			elementToAttachNodesTo instanceof ShadowRoot ||
			elementToAttachNodesTo instanceof HTMLElement
		)) {
			this.nodes.forEach(node => {
				if (node.parentNode !== elementToAttachNodesTo) {
					elementToAttachNodesTo.appendChild(node)
				}
			})
			this.renderTarget = elementToAttachNodesTo;
		}
		
		this.#executable.subExecutables.forEach(executable => {
			handleExecutable(executable, this.values);
		});
	}
}
