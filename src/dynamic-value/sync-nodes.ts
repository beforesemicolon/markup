import { changeCurrentIntoNewNodes } from './change-current-into-new-nodes'

export const syncNodes = (
    currentNodes: Array<Node>,
    newNodes: Array<Node>,
    parent: ParentNode | null = null
) => {
    if (newNodes.length) {
        changeCurrentIntoNewNodes(currentNodes, newNodes, parent)
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
