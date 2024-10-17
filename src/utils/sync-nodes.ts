import { HtmlTemplate } from '../html'
import { insertNodeAfter } from './insert-node-after'
import { getNodeOrTemplate } from '../utils/get-node-or-template'
import { DoubleLinkedList } from '../DoubleLinkedList'

/**
 * syncNodes nodes updated the current nodes with new ones while ensuring no node in the DOM
 * is moved or removed if dont have to using the currentChildNodes DoubleLinkedList as a representation
 * of the current DOM manipulating instead of relying on the DOM which painting happens after the execution
 * which means querying it would be inaccurate
 *
 * @param currentChildNodes - list of parent node child nodes
 * @param newChildNodes - list of nodes of how the parent node child nodes should become
 * @param anchorNode
 */
export const syncNodes = (
    currentChildNodes: DoubleLinkedList<Node | HtmlTemplate>,
    newChildNodes: Array<Node | HtmlTemplate>,
    anchorNode: Node,
    template: HtmlTemplate
) => {
    if (newChildNodes.length) {
        if (currentChildNodes.size) {
            const newChildNodesSet = DoubleLinkedList.fromArray(newChildNodes)
            let prevN: Node | HtmlTemplate = anchorNode
            let idx = 0
            let currentNode: Node | HtmlTemplate | null = currentChildNodes.head

            while (idx < newChildNodes.length || currentNode) {
                const newNode = newChildNodes.hasOwnProperty(idx)
                    ? getNodeOrTemplate(newChildNodes[idx])
                    : null
                const newAdded =
                    newNode &&
                    !currentChildNodes.has(newNode) &&
                    currentNode !== newNode
                let currentReplaced = false
                let currentRemoved = false
                let currentMoved = false

                if (!newNode && currentNode) {
                    currentRemoved = true
                } else if (currentNode && newNode) {
                    currentRemoved = !newChildNodesSet.has(currentNode)
                    currentReplaced =
                        currentRemoved && !currentChildNodes.has(newNode)
                    currentMoved =
                        !currentRemoved &&
                        !currentReplaced &&
                        currentNode !== newNode
                }

                if (newNode instanceof HtmlTemplate) {
                    newNode.__PARENT__ = template
                    template.__CHILDREN__.add(newNode)
                }

                if (currentMoved && newNode) {
                    const nextCurrentNode =
                        currentChildNodes.getNextValueOf(currentNode)

                    if (nextCurrentNode !== newNode) {
                        currentChildNodes.insertValueBefore(
                            newNode,
                            currentNode as Node
                        )
                        insertAfter(newNode, prevN)
                    } else {
                        currentChildNodes.remove(currentNode as Node)
                        currentNode =
                            currentChildNodes.getNextValueOf(nextCurrentNode)
                    }
                } else if (currentReplaced && newNode) {
                    insertAfter(newNode, prevN)
                    removeNodeOrTemplate(currentNode as Node)
                    const nextCurrentNode =
                        currentChildNodes.getNextValueOf(currentNode)
                    currentChildNodes.insertValueBefore(
                        newNode,
                        currentNode as Node
                    )
                    currentChildNodes.remove(currentNode as Node)
                    currentNode = nextCurrentNode
                } else if (currentRemoved) {
                    removeNodeOrTemplate(currentNode as Node)
                    const nextCurrentNode =
                        currentChildNodes.getNextValueOf(currentNode)
                    currentChildNodes.remove(currentNode as Node)
                    currentNode = nextCurrentNode
                    continue
                } else if (newAdded) {
                    insertAfter(newNode, prevN)
                    currentChildNodes.push(newNode)
                } else {
                    currentNode = currentChildNodes.getNextValueOf(currentNode)
                }

                if (newNode) prevN = newNode
                idx++
            }
        } else {
            const frag = document.createDocumentFragment()

            for (const newNode of newChildNodes) {
                const node = getNodeOrTemplate(newNode)

                if (node instanceof HtmlTemplate) {
                    node.render(frag)
                    node.__PARENT__ = template
                    template.__CHILDREN__.add(node)
                } else {
                    frag.appendChild(node)
                }

                currentChildNodes.push(node)
            }

            insertAfter(frag, anchorNode)
        }
    } else {
        for (const currentChildNode of currentChildNodes) {
            removeNodeOrTemplate(currentChildNode)
        }
        currentChildNodes.clear()
    }

    return currentChildNodes
}

function removeNodeOrTemplate(n: Node | HtmlTemplate) {
    if (n instanceof HtmlTemplate) {
        n.unmount()
    } else {
        n.parentNode?.removeChild(n)
    }
}

function insertAfter(newNode: Node | HtmlTemplate, prevN: Node | HtmlTemplate) {
    if (newNode instanceof HtmlTemplate) {
        newNode.insertAfter(prevN)
    } else if (prevN instanceof HtmlTemplate) {
        insertNodeAfter(newNode, prevN.__MARKERS__[1])
    } else {
        insertNodeAfter(newNode, prevN as Node)
    }
}
