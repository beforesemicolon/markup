import { HtmlTemplate } from '../html'
import { insertNodeAfter } from './insert-node-after'

/**
 * this function is to move nodes around without the need to unmount and remount them
 * to avoid unnecessary DOM changes especially for components. If node was not moved from its
 * position, they should remain untouched
 * @param currentChildNodes - list of parent node child nodes
 * @param newChildNodes - list of nodes of how the parent node child nodes should become
 * @param parent
 * @param prevNode
 */
export const syncNodes = (
    currentChildNodes: Array<Node | HtmlTemplate>,
    newChildNodes: Array<Node | HtmlTemplate>,
    parent: HTMLElement | Element | DocumentFragment | ShadowRoot,
    prevNode?: Node
) => {
    // todo: optimize text nodes so it can find nodes based on text values to avoid creating new nodes with same nodeValue
    const currentChildNodesSet = new Set(currentChildNodes)
    const currentFirstNode = currentChildNodes[0]
    const prevCurrentFirstNode =
        (currentFirstNode instanceof HtmlTemplate
            ? currentFirstNode.__MARKERS__[0].previousSibling
            : currentFirstNode?.previousSibling) ?? prevNode

    for (let i = 0; i < newChildNodes.length; i++) {
        const newNode = nodeOrTemplate(newChildNodes[i])
        const prevN = newChildNodes[i - 1] || prevCurrentFirstNode

        if (prevN) {
            if (newNode instanceof HtmlTemplate) {
                newNode.insertAfter(prevN)
            } else if (prevN instanceof HtmlTemplate) {
                insertNodeAfter(newNode, prevN.__MARKERS__[1])
            } else {
                insertNodeAfter(newNode, prevN)
            }
        } else if (newNode instanceof HtmlTemplate) {
            newNode.render(parent)
        } else {
            parent.appendChild(newNode)
        }

        currentChildNodesSet.delete(newNode)
    }

    currentChildNodesSet.forEach((n) => {
        if (n instanceof HtmlTemplate) {
            n.unmount()
        } else {
            n.parentNode?.removeChild(n)
        }
    })

    return newChildNodes
}

function nodeOrTemplate(value: unknown) {
    if (value instanceof Node || value instanceof HtmlTemplate) return value
    return document.createTextNode(String(value))
}
