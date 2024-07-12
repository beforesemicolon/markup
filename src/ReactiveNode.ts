import { HtmlTemplate } from './html'
import { effect } from './state'
import { syncNodes } from './utils/sync-nodes'
import { EffectUnSubscriber } from './types'
import { renderContent } from './utils/render-content'
import { toNodes } from './utils/to-nodes'

export class ReactiveNode {
    #result: Array<Node | HtmlTemplate> = []
    #unsubEffect: EffectUnSubscriber | null = null
    #parent: HTMLElement | Element | null = null
    #updateSub: (() => void) | undefined = undefined

    get parentNode() {
        return this.#parent
    }

    get nodes(): Node[] {
        // need to dynamically read nodes in case the HTMLTemplate changes
        // due to having its own ReactiveNodes
        return toNodes(this.#result)
    }

    get isConnected() {
        return this.#parent !== null
    }

    get refs(): Record<string, Array<Element>> {
        return this.#result.reduce((acc, item) => {
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
                    this.#result = syncNodes(
                        this.#result,
                        Array.isArray(res) ? res : [res],
                        this.parentNode as HTMLElement
                    )
                    this.#updateSub?.()
                } else {
                    renderContent(res, parentNode, (item) => {
                        this.#result.push(item)
                    })
                    init = true
                }
            })
        }
    }

    unmount() {
        this.#unsubEffect?.()
        for (const item of this.#result) {
            if (item instanceof Node) {
                item.parentNode?.removeChild(item)
            } else {
                item.unmount()
            }
        }
        this.#parent = null
        this.#result = []
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
