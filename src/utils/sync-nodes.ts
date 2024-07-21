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
        const currentChildNodesSet = new Set(currentChildNodes),
            endAnchor = lastNode(currentChildNodes)?.nextSibling ?? null
        let frag = document.createDocumentFragment()

        for (let i = 0; i < newChildNodes.length; i++) {
            const n = nodeOrTemplate(newChildNodes[i]),
                moved = currentChildNodes[i] !== n

            if (moved || !currentChildNodesSet.has(n)) {
                if (n instanceof HtmlTemplate) {
                    n.render(frag)
                } else frag.appendChild(n)

                if (moved) {
                    currentChildNodesSet.delete(n)
                }
            } else {
                if (frag.childNodes.length) {
                    if (n instanceof HtmlTemplate) {
                        const c = n.__MARKERS__[0]
                        c.parentNode?.insertBefore(frag as DocumentFragment, c)
                    } else
                        n.parentNode?.insertBefore(frag as DocumentFragment, n)
                    frag = document.createDocumentFragment()
                }

                currentChildNodesSet.delete(n)
            }

            renderedItems.push(n)
        }

        if (frag.childNodes.length) {
            if (endAnchor === null) {
                parent?.appendChild(frag)
            } else {
                endAnchor.parentNode?.insertBefore(frag, endAnchor)
            }
        }

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

function lastNode(nodes: Array<Node | HtmlTemplate>): Node | null {
    const last = nodes.at(-1) as Node | HtmlTemplate

    if (last instanceof Node) {
        return last
    }

    return last ? last.__MARKERS__[1] : null
}
