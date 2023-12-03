/**
 * this function is to move nodes around without the need to unmount and remount them
 * to avoid unnecessary DOM changes especially for components. If node was not moved from its
 * position, they should remain untouched
 * @param currentChildNodes - list of parent node child nodes
 * @param newChildNodes - list of nodes of how the parent node child nodes should become
 * @param parent
 */
export const changeCurrentIntoNewItems = (
    currentChildNodes: Node[],
    newChildNodes: Node[],
    parent: ParentNode | null
) => {
    const currentChildNodesSet = new Set(currentChildNodes)
    const lastNode = currentChildNodes.at(-1)
    const endAnchor = lastNode?.nextSibling ?? null
    let frag: DocumentFragment = document.createDocumentFragment()

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
