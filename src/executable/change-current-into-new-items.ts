/**
 * this function is to move nodes around without the need to unmount and remount them
 * to avoid unnecessary DOM changes especially for components. If node was not moved from its
 * position, they should remain untouched
 * @param currentChildNodes - list of parent node child nodes
 * @param newChildNodes - list of nodes of how the parent node child nodes should become
 * @param endNode - an anchored node placed right after the last of the currentlyRendered nodes
 */
export const changeCurrentIntoNewItems = (currentChildNodes: Node[], newChildNodes: Node[], endNode: Node) => {
	const newChildNodesSet = new Set(newChildNodes);
	
	if (currentChildNodes.length && newChildNodes.length) {
		const notRemovedCurrentItems: Node[] = [];
		
		for (let currentItem of currentChildNodes) {
			if (!newChildNodesSet.has(currentItem)) {
				currentItem.parentNode?.removeChild(currentItem);
			} else {
				notRemovedCurrentItems.push(currentItem)
			}
		}
		
		/**
		 * handle case where some nodes are left rendered
		 * otherwise is the same as adding all new nodes
		 */
		if (notRemovedCurrentItems.length) {
			let ci = 0;
			let ni = 0;
			const insertedNodesSet: Set<Node> = new Set()
			
			while(ni < newChildNodes.length) {
				const c = notRemovedCurrentItems[ci];
				const n = newChildNodes[ni];
				
				/**
				 * if a node was previously inserted, move the needle to the next current node
				 * never inserted and resume the comparison
				 */
				if(insertedNodesSet.has(c)) {
					ci += 1;
					continue;
				}
				
				/**
				 * if nodes are the same and the same position move the needles
				 * otherwise move the new node right in front and move to the next new node
				 */
				if(c !== n) {
					(c || endNode)?.parentNode?.insertBefore(n, c);
					insertedNodesSet.add(n);
					ni += 1;
				} else {
					ci += 1;
					ni += 1;
				}
			}
			
			return;
		}
		
		currentChildNodes = [];
	}
	
	if(newChildNodes.length) {
		/**
		 * if no current items, just insert all the new items in the order they came
		 */
		newChildNodes.forEach(n => {
			endNode.parentNode?.insertBefore(n, endNode)
		})
	} if(currentChildNodes.length) {
		currentChildNodes.forEach(n => {
			n?.parentNode?.removeChild(n)
		})
	}
}
