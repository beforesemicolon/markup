/**
 * this function is to move nodes around without the need to unmount and remount them
 * to avoid unnecessary DOM changes especially for components. If node was not moved from its
 * position, they should remain untouched
 * @param currentChildNodes - list of parent node child nodes
 * @param newChildNodes - list of nodes of how the parent node child nodes should become
 * @param endNode - an anchored node placed right after the last of the currentlyRendered nodes
 */
export const changeCurrentIntoNewItems = (currentChildNodes: Node[], newChildNodes: Node[], endNode: Node) => {
	const currentChildNodesSet = new Set(currentChildNodes);
	let frag: DocumentFragment = document.createDocumentFragment();
	
	newChildNodes.forEach((n, i) => {
		const moved = currentChildNodes[i] !== n;
		if(moved || !currentChildNodesSet.has(n)) {
			frag.appendChild(n);
			
			if (moved) {
				currentChildNodesSet.delete(n);
			}
		} else {
			if (frag.childNodes.length) {
				n.parentNode?.insertBefore(frag as DocumentFragment, n);
				frag = document.createDocumentFragment();
			}
			
			currentChildNodesSet.delete(n);
		}
	})
	
	if (frag.childNodes.length) {
		endNode.parentNode?.insertBefore(frag as DocumentFragment, endNode);
	}
	
	currentChildNodesSet.forEach(c => {
		c?.parentNode?.removeChild(c)
	})
}
