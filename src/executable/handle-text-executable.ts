import { ExecutableValue } from '../types'
import { changeCurrentIntoNewItems } from './change-current-into-new-items'
import { doc } from '../doc'

export const handleTextExecutable = (
    executableValue: ExecutableValue,
    nodes: Array<Node>,
    el: Node
) => {
    if (nodes.length) {
        const parent =
            executableValue.renderedNodes[0]?.parentNode ?? el.parentNode

        changeCurrentIntoNewItems(executableValue.renderedNodes, nodes, parent)

        executableValue.renderedNodes = nodes
    } else {
        const n = executableValue.renderedNodes[0]

        const emptyNode = doc.createTextNode('')
        n.parentNode?.replaceChild(emptyNode, n)

        if (Array.isArray(executableValue.renderedNodes)) {
            executableValue.renderedNodes.forEach((n: Node) => {
                n.parentNode?.removeChild(n)
            })
        }

        executableValue.renderedNodes = [emptyNode]
    }
}
