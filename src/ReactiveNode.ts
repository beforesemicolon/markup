import { HtmlTemplate } from './html'
import { effect } from './state'
import { syncNodes } from './utils/sync-nodes'
import { EffectUnSubscriber } from './types'
import { renderContent } from './utils/render-content'

export class ReactiveNode {
    #result: Array<Node | HtmlTemplate> = []
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

            parentNode.appendChild(this.#anchor)

            this.#unsubEffect = effect(() => {
                const res = action()

                if (init) {
                    this.#result = syncNodes(
                        this.#result,
                        Array.isArray(res) ? res : [res],
                        parentNode,
                        this.#anchor
                    )
                    this.#updateSub?.()
                } else {
                    this.#result = renderContent(res, parentNode)
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
