import { changeCurrentIntoNewItems } from './change-current-into-new-items'

export const syncNodes = (
    currentNodes: Array<Node>,
    newNodes: Array<Node>,
    parent: ParentNode | null = null
) => {
    if (newNodes.length) {
        changeCurrentIntoNewItems(currentNodes, newNodes, parent)
        return newNodes
    }

    const n = currentNodes[0]

    const emptyNode = document.createTextNode('')
    n.parentNode?.replaceChild(emptyNode, n)

    currentNodes.forEach((n: Node) => {
        n.parentNode?.removeChild(n)
    })

    return [emptyNode]
}
