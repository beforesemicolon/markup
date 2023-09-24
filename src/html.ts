import {Executable} from "./types";
import {collectExecutables} from "./executable/collect-executable";
import {handleExecutable} from "./executable/handle-executable";
import {parse} from "@beforesemicolon/html-parser";

// prevents others from creating functions that can be subscribed to
// and forces them to use useValue instead
const id = 'S' + Math.floor(Math.random() * 10000000);
class ValueGetSet<T> extends Array {
	// create a set of weak references instead of a weakSet
	// because we still need to iterate the references which weakSet does not allow
	#subs: Set<WeakRef<HtmlTemplate>> = new Set();
	
	constructor(val: any) {
		super(2); // tuple
		
		this[0] = () => val;
		this[1] = (newVal:  T | ((val: T) => T)) => {
			val = typeof newVal == 'function' ? (newVal as (val: T) => T)(val) : newVal;
			this.#subs.forEach((ref) => {
				const h = ref.deref(); // get the real value
				if (h) {
					h?.update()
				} else {
					// get rid of the reference if the HtmlTemplate has been destroyed
					this.#subs.delete(ref);
				}
			});
		};
		
		Object.defineProperty(this[0], id, {
			// ensure only HtmlTemplate can subscribe to this value
			value: (sub: HtmlTemplate, subId: string) => {
				if (subId === id && sub instanceof HtmlTemplate) {
					const h = new WeakRef(sub);
					this.#subs.add(h);
					
					return () => {
						this.#subs.delete(h);
					};
				}
			}
		})
		
		Object.freeze(this);
	}
}

export const useValue = <T>(val: T) => {
	return new ValueGetSet(val);
}

export class HtmlTemplate {
	#htmlTemplate: string;
	#nodes: WeakRef<Node>[] = [];
	#renderTarget: HTMLElement | ShadowRoot | Element | null = null;
	#refs: Record<string, Set<Element>> = {};
	#executablesByNode: Map<WeakRef<Node>, Executable> = new Map();
	
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
		return this.#nodes.filter(r => r.deref()).flatMap(n => {
			const node = n.deref() as Node;
			const e = this.#executablesByNode.get(n);
			
			if (e?.content.length) {
				return Array.from(new Set(
					e.content.flatMap(v => Array.isArray(v.renderedNode) ? v.renderedNode : [v.renderedNode])
				));
			}
			
			return [node];
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
			if (v instanceof HtmlTemplate) {
				return {...acc, ...v.refs}
			}
			
			return acc;
		}, {} as Record<string, Array<Element>>)
		
		return Object.freeze({
			...valueRefs,
			...Object.entries(this.#refs).reduce((acc, [key, set]) => ({
				...acc,
				[key]: Array.from(new Set([...Array.from(set), ...(valueRefs[key] ?? [])]))
			}), {})
		});
	}
	
	constructor(parts: TemplateStringsArray, private values: unknown[]) {
		this.#htmlTemplate = parts.map((s, i) => {
			return i == parts.length - 1 ? s : s + `{{val${i}}}`;
		}).join("").trim();
		
		const nodeRefMap = new Map();
		
		const root = parse(this.#htmlTemplate, (node: Node) => {
			const executable = collectExecutables(node, values, this.#refs);
			if (
				executable.content.length ||
				executable.events.length ||
				executable.directives.length ||
				executable.attributes.length
			) {
				const nr = new WeakRef(node);
				nodeRefMap.set(node, nr);
				this.#executablesByNode.set(nr, executable);
				handleExecutable(node, executable, this.#refs);
			}
		});
		
		this.#nodes = Array.from(root.childNodes, n => {
			return nodeRefMap.get(n) ?? new WeakRef(n)
		});
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
			this.values.forEach(val => {
				// @ts-ignore is a getter created by useValue
				if (typeof val === 'function' && typeof val[id] === "function") {
					// @ts-ignore subscribe to auto update on changes
					val[id](this, id)
				}
			})
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
			let element: HTMLElement = target as HTMLElement;
			
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
			} else if (element.parentNode) {
				element.parentNode.replaceChild(getFrag(), element);
			} else {
				return;
			}
			
			this.#renderTarget = element;
			return;
		}
		
		throw new Error(`Invalid replace target element. Received ${target}`)
	}
	
	/**
	 * updates the already rendered DOM Nodes with the update values
	 */
	update() {
		// only update if the nodes were already rendered and there are actual values
		if (this.renderTarget) {
			this.#executablesByNode.forEach((executable, nodeRef) => {
				const node = nodeRef.deref();
				if (node) {
					handleExecutable(node, executable, this.#refs);
				} else {
					// get rid of the reference if the node has been destroyed
					this.#executablesByNode.delete(nodeRef);
				}
			});
		}
	}
	
	unmount() {
		this.values.forEach(val => {
			if(val instanceof HtmlTemplate) {
				val.unmount();
			}
		});
		this.nodes.forEach(n => {
			if (n.parentNode) {
				n.parentNode.removeChild(n);
			}
		})
		this.#renderTarget = null;
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
