import { moveNodesBefore } from './move-nodes-before.ts'

export function insertNodeAfter(newNode: Node, referenceNode: Node) {
    const parent = referenceNode.parentNode
    if (!parent) return

    moveNodesBefore([newNode], parent, referenceNode.nextSibling)
}
