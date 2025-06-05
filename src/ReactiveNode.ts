import { HtmlTemplate } from './html.ts'
import { effect } from './state.ts'
import { syncNodes } from './utils/sync-nodes.ts'
import { EffectUnSubscriber } from './types.ts'
import { renderContent } from './utils/render-content.ts'
import { DoubleLinkedList } from './DoubleLinkedList.ts'

export class ReactiveNode {
    #result = new DoubleLinkedList<Node | HtmlTemplate>()
    #unsubEffect?: EffectUnSubscriber
    #parent?: DocumentFragment | HTMLElement | Element
    #updateSub?: () => void
    #anchor = document.createTextNode('')

    get parentNode() {
        return this.#parent
    }

    get isConnected() {
        return this.#parent !== null
    }

    get refs(): Record<string, Array<Element>> {
        const collectedRefs: Record<string, Array<Element>> = {}

        for (const item of this.#result) {
            if (item instanceof HtmlTemplate) {
                const templateRefs = item.refs // item.refs is Record<string, Array<Element>>
                for (const key in templateRefs) {
                    if (
                        Object.prototype.hasOwnProperty.call(templateRefs, key)
                    ) {
                        collectedRefs[key] = templateRefs[key] // Assign properties directly
                    }
                }
            }
        }

        return collectedRefs
    }

    constructor(
        action: (anchor: Node, temp: HtmlTemplate) => unknown,
        parentNode: DocumentFragment | HTMLElement | Element,
        template: HtmlTemplate
    ) {
        let init = false

        if (parentNode) {
            this.#parent = parentNode

            parentNode.appendChild(this.#anchor)

            this.#unsubEffect = effect(() => {
                const res = action(this.#anchor, template)

                if (init) {
                    this.#result = syncNodes(
                        this.#result,
                        Array.isArray(res) ? res : [res],
                        this.#anchor,
                        template
                    )
                    this.#updateSub?.()
                } else {
                    const frag = document.createDocumentFragment()
                    renderContent(res, frag, (item) => {
                        this.#result.push(item)
                        if (item instanceof HtmlTemplate) {
                            item.__PARENT__ = template
                            template.__CHILDREN__.add(item)
                        }
                    })
                    parentNode.appendChild(frag)
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
        this.#parent = undefined
        this.#result.clear()
        this.#unsubEffect = undefined
        this.#updateSub = undefined
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
