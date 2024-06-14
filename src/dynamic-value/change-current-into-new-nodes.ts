/**
 * this function is to move nodes around without the need to unmount and remount them
 * to avoid unnecessary DOM changes especially for components. If node was not moved from its
 * position, they should remain untouched
 * @param currentChildNodes - list of parent node child nodes
 * @param newChildNodes - list of nodes of how the parent node child nodes should become
 * @param parent
 */
export const changeCurrentIntoNewNodes = (
    currentChildNodes: Node[],
    newChildNodes: Node[],
    parent: ParentNode | null = null
) => {
    // if no new child nodes, simply remove all current child nodes
    if (newChildNodes.length === 0) {
        return currentChildNodes.forEach((c) => c?.parentNode?.removeChild(c))
    }

    // if not current child nodes simply add everything
    if (currentChildNodes.length === 0) {
        return newChildNodes.forEach((n) => parent?.appendChild(n))
    }

    // if both new and current child nodes contain one node
    // simply swap them if they are not the same node
    if (newChildNodes.length === 1 && currentChildNodes.length === 1) {
        const newChild = newChildNodes[0]
        const currentChild = currentChildNodes[0]

        if (newChild !== currentChild) {
            currentChild?.parentNode?.replaceChild(newChild, currentChild)
        }

        return
    }

    const currentChildNodesSet = new Set(currentChildNodes),
        endAnchor = currentChildNodes.at(-1)?.nextSibling ?? null
    let frag = document.createDocumentFragment()

    newChildNodes.forEach((n, i) => {
        const moved = currentChildNodes[i] !== n
        if (moved || !currentChildNodesSet.has(n)) {
            frag.appendChild(n)

            if (moved) {
                currentChildNodesSet.delete(n)
            }
        } else {
            if (frag.childNodes.length) {
                n.parentNode?.insertBefore(frag as DocumentFragment, n)
                frag = document.createDocumentFragment()
            }

            currentChildNodesSet.delete(n)
        }
    })

    if (frag.childNodes.length) {
        if (endAnchor === null) {
            parent?.appendChild(frag)
        } else {
            endAnchor.parentNode?.insertBefore(frag, endAnchor)
        }
    }

    currentChildNodesSet.forEach((c) => {
        c?.parentNode?.removeChild(c)
    })
}
