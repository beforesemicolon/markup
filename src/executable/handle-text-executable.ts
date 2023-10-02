import { ExecutableValue } from '../types'
import { changeCurrentIntoNewItems } from './change-current-into-new-items'

export const handleTextExecutable = (
    executableValue: ExecutableValue,
    nodes: Array<Node>,
    el: Node
) => {
    const renderedIsAList = Array.isArray(executableValue.renderedNode)

    if (nodes.length) {
        if (renderedIsAList) {
            const renderedNodes = executableValue.renderedNode as Node[]

            const parent = renderedNodes[0].parentNode ?? el.parentNode

            changeCurrentIntoNewItems(
                executableValue.renderedNode as Node[],
                nodes,
                parent
            )
        } else {
            const frag = document.createDocumentFragment()
            const r = executableValue.renderedNode as Node

            frag.append(...nodes)

            const parent =
                (executableValue.renderedNode as Node).parentNode ??
                el.parentNode
            parent?.replaceChild(frag, r)
        }

        executableValue.renderedNode = nodes
    } else {
        const n = renderedIsAList
            ? (executableValue.renderedNode as Node[])[0]
            : (executableValue.renderedNode as Node)

        const emptyNode = document.createTextNode('')
        n.parentNode?.replaceChild(emptyNode, n)

        if (Array.isArray(executableValue.renderedNode)) {
            executableValue.renderedNode.forEach((n: Node) => {
                n.parentNode?.removeChild(n)
            })
        }

        executableValue.renderedNode = emptyNode
    }
}
