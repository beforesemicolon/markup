import { HtmlTemplate } from './html'
import { effect } from './state'
import { syncNodes } from './utils/sync-nodes'
import { EffectUnSubscriber } from './types'
import { renderContent } from './utils/render-content'

export class ReactiveNode {
    #nodes: Node[] = []
    #result: unknown
    #unsubEffect: EffectUnSubscriber | null = null
    #parent: HTMLElement | DocumentFragment | null = null

    get parentNode() {
        return this.#parent
    }

    get nodes(): Node[] {
        return this.#nodes
    }

    get isConnected() {
        return this.#parent !== null
    }

    get refs(): Record<string, Array<Element>> {
        return (
            Array.isArray(this.#result) ? this.#result : [this.#result]
        ).reduce((acc, item) => {
            if (item instanceof HtmlTemplate) {
                return {
                    ...acc,
                    ...item.refs,
                }
            }

            return acc
        }, {})
    }

    constructor(action: () => unknown, parentNode: HTMLElement) {
        let init = false

        if (parentNode) {
            this.#parent = parentNode

            this.#unsubEffect = effect(() => {
                const res = action()

                if (init) {
                    const frag = document.createDocumentFragment()
                    const list = Array.isArray(res) ? res : [res]
                    const newNodes = list.flatMap((item) =>
                        renderContent(item, frag)
                    )

                    this.#nodes = syncNodes(
                        this.#nodes,
                        newNodes,
                        this.parentNode
                    )

                    unmountMountable(getPreviousMountable(this.#result, res))
                } else {
                    this.#nodes = renderContent(res, parentNode)
                }

                init = true
                this.#result = res
            })
        }
    }

    unmount() {
        this.#unsubEffect?.()
        unmountMountable(this.#result)
        for (const node of this.#nodes) {
            node.parentNode?.removeChild(node)
        }
    }

    /**
     * this should be used in case ReactiveNode was rendered in a DocumentFragment
     * and then this DocumentFragment was appended to another Element from which case
     * this will help ReactiveNode update its parent reference to the correct one without
     * having to render again
     * @param newParent
     */
    updateParentReference(newParent: HTMLElement) {
        if (newParent && newParent instanceof Node) {
            this.#parent = newParent
        }
    }
}

function unmountMountable(item: unknown) {
    if (item instanceof ReactiveNode || item instanceof HtmlTemplate) {
        item.unmount()
    } else if (Array.isArray(item)) {
        for (const i of item) {
            unmountMountable(i)
        }
    }
}

function getPreviousMountable(current: unknown, diff: unknown) {
    const currentTemps = new Set(
        (Array.isArray(current) ? current : [current]).filter(
            (item) =>
                item instanceof ReactiveNode || item instanceof HtmlTemplate
        )
    )
    const newTemps = new Set(
        (Array.isArray(diff) ? diff : [diff]).filter(
            (item) =>
                item instanceof ReactiveNode || item instanceof HtmlTemplate
        )
    )

    return [...currentTemps].filter((item) => !newTemps.has(item))
}
