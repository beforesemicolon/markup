import { HtmlTemplate } from '../html'

/**
 * this function is to move nodes around without the need to unmount and remount them
 * to avoid unnecessary DOM changes especially for components. If node was not moved from its
 * position, they should remain untouched
 * @param currentChildNodes - list of parent node child nodes
 * @param newChildNodes - list of nodes of how the parent node child nodes should become
 * @param parent
 */
export const syncNodes = (
    currentChildNodes: Array<Node | HtmlTemplate>,
    newChildNodes: Array<Node | HtmlTemplate>,
    parent: HTMLElement | Element
) => {
    const renderedItems: Array<Node | HtmlTemplate> = []

    // if no new child nodes, simply remove all current child nodes
    if (newChildNodes.length === 0) {
        for (let item of currentChildNodes) {
            item = nodeOrTemplate(item)
            if (item instanceof HtmlTemplate) item.unmount()
            else item?.parentNode?.removeChild(item)
        }
    } else if (currentChildNodes.length === 0) {
        for (let item of newChildNodes) {
            item = nodeOrTemplate(item)
            if (item instanceof HtmlTemplate) item.render(parent)
            else parent?.appendChild(item)
            renderedItems.push(item)
        }
    } else if (newChildNodes.length === 1 && currentChildNodes.length === 1) {
        const newChild = nodeOrTemplate(newChildNodes[0])
        const currentChild = nodeOrTemplate(currentChildNodes[0])

        if (newChild !== currentChild) {
            if (newChild instanceof HtmlTemplate) newChild.replace(currentChild)
            else if (currentChild instanceof HtmlTemplate) {
                currentChild.parentNode?.insertBefore(
                    newChild,
                    currentChild.__MARKERS__[0]
                )
                currentChild.unmount()
            } else
                currentChild?.parentNode?.replaceChild(newChild, currentChild)
            renderedItems.push(newChild)
        }
    } else {
        const currentChildNodesSet = new Set(currentChildNodes)

        const firstN = firstNode(currentChildNodes)
        let prevNode = firstN.previousSibling as Node
        let txt: Text | null = null

        if (!prevNode) {
            txt = document.createTextNode('')
            firstN.parentNode?.insertBefore(txt, firstN)
            prevNode = txt
        }

        for (let i = 0; i < newChildNodes.length; i++) {
            const n = nodeOrTemplate(newChildNodes[i]),
                moved = currentChildNodes[i] !== n,
                nIsTemplate = n instanceof HtmlTemplate

            if (moved) {
                if (nIsTemplate) {
                    const frag = document.createDocumentFragment()
                    n.render(frag)
                    insertNodeAfter(frag, prevNode)
                } else {
                    insertNodeAfter(n, prevNode)
                }
            }

            prevNode = nIsTemplate ? n.__MARKERS__[1] : n

            currentChildNodesSet.delete(n)
            renderedItems.push(n)
        }

        txt?.parentNode?.removeChild(txt)

        for (const c of currentChildNodesSet) {
            if (c instanceof HtmlTemplate) c.unmount()
            else c?.parentNode?.removeChild(c)
        }
    }

    return renderedItems
}

function nodeOrTemplate(value: unknown) {
    if (value instanceof Node || value instanceof HtmlTemplate) return value
    return document.createTextNode(String(value))
}

function firstNode(nodes: Array<Node | HtmlTemplate>) {
    if (nodes[0] instanceof Node) {
        return nodes[0]
    }

    return nodes[0].__MARKERS__[0]
}

function insertNodeAfter(newNode: Node, referenceNode: Node) {
    if (referenceNode.nextSibling && referenceNode.nextSibling !== newNode)
        referenceNode.parentNode?.insertBefore(
            newNode,
            referenceNode.nextSibling
        )
    else if (
        referenceNode.parentNode?.childNodes[
            referenceNode.parentNode?.childNodes.length - 1
        ] !== newNode
    )
        referenceNode.parentNode?.appendChild(newNode)
}
