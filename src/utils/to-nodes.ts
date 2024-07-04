import { ReactiveNode } from '../ReactiveNode'
import { HtmlTemplate } from '../html'

export function toNodes(value: Array<HtmlTemplate | ReactiveNode | Node>) {
    let nodes: Node[] = []

    for (const n of value) {
        if (n instanceof HtmlTemplate || n instanceof ReactiveNode) {
            nodes = nodes.concat(n.nodes)
        } else {
            nodes.push(n)
        }
    }

    return nodes
}
