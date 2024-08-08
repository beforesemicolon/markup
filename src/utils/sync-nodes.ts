import { HtmlTemplate } from '../html'
import { insertNodeAfter } from './insert-node-after'
import { getNodeOrTemplate } from '../utils/get-node-or-template'
import { DoubleLinkedList } from '../DoubleLinkedList'

/**
 * this function is to move nodes around without the need to unmount and remount them
 * to avoid unnecessary DOM changes especially for components. If node was not moved from its
 * position, they should remain untouched
 * @param currentChildNodes - list of parent node child nodes
 * @param newChildNodes - list of nodes of how the parent node child nodes should become
 * @param anchorNode
 */
export const syncNodes = (
    currentChildNodes: DoubleLinkedList<Node | HtmlTemplate>,
    newChildNodes: Array<Node | HtmlTemplate>,
    anchorNode: Node
) => {
    const ll = new DoubleLinkedList<Node | HtmlTemplate>()

    if (newChildNodes.length) {
        const newChildNodesSet = new Set(newChildNodes)
        let prevN: Node | HtmlTemplate = anchorNode
        let idx = 0
        let currentN: Node | HtmlTemplate | null = currentChildNodes.head

        while (idx < newChildNodes.length || currentN) {
            if (currentN && !newChildNodesSet.has(currentN)) {
                removeNodeOrTemplate(currentN)
                const nextN = currentChildNodes.getNextValueOf(currentN)
                currentChildNodes.remove(currentN)
                currentN = nextN
                continue
            }

            const newNode = getNodeOrTemplate(newChildNodes[idx])

            if (
                newNode !== currentN &&
                currentChildNodes.getPreviousValueOf(currentN) !== newNode
            ) {
                if (newNode instanceof HtmlTemplate) {
                    newNode.insertAfter(prevN)
                } else if (currentN instanceof HtmlTemplate) {
                    insertNodeAfter(newNode, currentN.__MARKERS__[1])
                } else {
                    insertNodeAfter(newNode, prevN as Node)
                }

                if (currentN) {
                    currentChildNodes.insertValueBefore(newNode, currentN)
                } else {
                    currentChildNodes.push(newNode)
                }
            }

            ll.push(newNode)
            currentN = currentChildNodes.getNextValueOf(currentN)
            prevN = newNode
            idx++
        }
    } else {
        for (const currentChildNode of currentChildNodes) {
            removeNodeOrTemplate(currentChildNode)
        }
        currentChildNodes.clear()
    }

    return ll
}

function removeNodeOrTemplate(n: Node | HtmlTemplate) {
    if (n instanceof HtmlTemplate) {
        n.unmount()
    } else {
        n.parentNode?.removeChild(n)
    }
}
