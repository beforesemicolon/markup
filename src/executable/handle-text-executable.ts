import {ExecutableValue} from "../types";
import {changeCurrentIntoNewItems} from "./change-current-into-new-items";

export const handleTextExecutable = (executableValue: ExecutableValue, nodes: Array<Node>) => {
	const renderedIsAList = Array.isArray(executableValue.renderedNode);
	
	if (nodes.length) {
		if (renderedIsAList) {
			const renderedNodes = executableValue.renderedNode as Node[];
			const lastNode = renderedNodes.at(-1);
			const comment = document.createComment("");
			let endAnchor: Node = lastNode?.nextSibling ?? comment;
			
			changeCurrentIntoNewItems(renderedNodes, nodes, () => {
				// only render the anchor node when it is really needed
				// otherwise it will cause unnecessary DOM update
				if (endAnchor === comment) {
					lastNode?.parentNode?.appendChild(endAnchor)
				}
				
				return endAnchor;
			})
			
			if (endAnchor === comment) {
				endAnchor?.parentNode?.removeChild(endAnchor)
			}
		} else {
			const frag = document.createDocumentFragment()
			const r = executableValue.renderedNode as Node;
			
			frag.append(...nodes);
			
			r.parentNode?.replaceChild(frag, r);
		}
		
		executableValue.renderedNode = nodes;
	} else {
		let n = renderedIsAList
			? (executableValue.renderedNode as Node[])[0]
			: executableValue.renderedNode as Node;
		
		const emptyNode = document.createTextNode("");
		n.parentNode?.replaceChild(emptyNode, n);
		
		if (renderedIsAList) {
			(executableValue.renderedNode as Node[]).forEach(n => {
				n.parentNode?.removeChild(n);
			})
		}
		
		executableValue.renderedNode = emptyNode;
	}
}
