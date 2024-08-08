import { HtmlTemplate } from './html'
import { effect } from './state'
import { syncNodes } from './utils/sync-nodes'
import { EffectUnSubscriber, RenderType } from './types'
import { renderContent } from './utils/render-content'
import { DoubleLinkedList } from './DoubleLinkedList'

export class ReactiveNode {
    #result = new DoubleLinkedList<Node | HtmlTemplate>()
    #unsubEffect: EffectUnSubscriber | null = null
    #parent: HTMLElement | Element | null = null
    #updateSub: (() => void) | undefined = undefined
    #anchor = document.createTextNode('')

    get parentNode() {
        return this.#parent
    }

    get isConnected() {
        return this.#parent !== null
    }

    get refs(): Record<string, Array<Element>> {
        let acc = {}

        for (const item of this.#result) {
            if (item instanceof HtmlTemplate) {
                acc = {
                    ...acc,
                    ...item.refs,
                }
            }
        }

        return acc
    }

    constructor(action: (anchor: Node) => unknown, parentNode: HTMLElement) {
        let init = false

        if (parentNode) {
            this.#parent = parentNode

            parentNode.appendChild(this.#anchor)

            this.#unsubEffect = effect(() => {
                const res = action(this.#anchor)

                if (res === RenderType.Skip) return

                if (init) {
                    this.#result = syncNodes(
                        this.#result,
                        Array.isArray(res) ? res : [res],
                        this.#anchor
                    )
                    this.#updateSub?.()
                } else {
                    renderContent(res, parentNode, (item) =>
                        this.#result.push(item)
                    )
                    init = true
                }
            })
        }
    }

    unmount() {
        this.#unsubEffect?.()
        for (const item of this.#result) {
            if (item instanceof HtmlTemplate) {
                item.unmount()
            } else {
                item.parentNode?.removeChild(item)
            }
        }
        this.#anchor.parentNode?.removeChild(this.#anchor)
        this.#parent = null
        this.#result.clear()
    }

    onUpdate(cb: () => void) {
        this.#updateSub = cb
        return this
    }

    /**
     * this should be used in case ReactiveNode was rendered in a DocumentFragment
     * and then this DocumentFragment was appended to another Element from which case
     * this will help ReactiveNode update its parent reference to the correct one without
     * having to render again
     * @param newParent
     */
    updateParentReference(newParent: HTMLElement | Element) {
        if (newParent && newParent instanceof Node) {
            this.#parent = newParent
        }
    }
}
