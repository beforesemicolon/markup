export function insertNodeAfter(newNode: Node, referenceNode: Node) {
    requestAnimationFrame(() => {
        if (
            referenceNode.nextSibling &&
            referenceNode.nextSibling !== newNode
        ) {
            referenceNode.parentNode?.insertBefore(
                newNode,
                referenceNode.nextSibling
            )
        } else if (
            referenceNode.parentNode?.childNodes[
                referenceNode.parentNode?.childNodes.length - 1
            ] !== newNode
        ) {
            referenceNode.parentNode?.appendChild(newNode)
        }
    })
}
