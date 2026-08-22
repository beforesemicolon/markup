export function insertNodeAfter(newNode: Node, referenceNode: Node) {
    const parent = referenceNode.parentNode
    if (!parent) return

    if (referenceNode.nextSibling && referenceNode.nextSibling !== newNode) {
        parent.insertBefore(newNode, referenceNode.nextSibling)
    } else if (parent.lastChild !== newNode) {
        parent.appendChild(newNode)
    }
}
