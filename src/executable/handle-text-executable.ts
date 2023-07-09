import {ExecutableValue} from "./type";
import {changeCurrentIntoNewItems} from "./change-current-into-new-items";

export const handleTextExecutable = (executableValue: ExecutableValue, nodes: Node[]) => {
	const renderedIsAList = Array.isArray(executableValue.renderedNode);
	
	if (nodes.length) {
		if (renderedIsAList) {
			const renderedNodes = executableValue.renderedNode as Node[];
			const lastNode = renderedNodes.at(-1);
			const comment = document.createComment("");
			let endAnchor: Node = lastNode?.nextSibling ?? comment;
			
			if (endAnchor === comment) {
				lastNode?.parentNode?.appendChild(endAnchor)
			}
			
			changeCurrentIntoNewItems(renderedNodes, nodes, endAnchor)
			
			if (endAnchor === comment) {
				endAnchor?.parentNode?.removeChild(endAnchor)
			}
		} else {
			const r = executableValue.renderedNode as Node;
			
			nodes.forEach((n) => {
				r.parentNode?.insertBefore(n, r);
			});
			
			r.parentNode?.removeChild(r);
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
