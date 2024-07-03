import { ReactiveNode } from '../ReactiveNode'
import { HtmlTemplate } from '../html'

export function toNodes(value: Array<HtmlTemplate | ReactiveNode | Node>) {
    return value.flatMap((n) =>
        n instanceof HtmlTemplate || n instanceof ReactiveNode ? n.nodes : n
    )
}
