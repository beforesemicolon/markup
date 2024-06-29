import { parseDynamicRawValue } from './dynamic-value/parse-dynamic-raw-value'
import { HtmlTemplate } from './html'
import { effect } from './state'
import { syncNodes } from './dynamic-value/sync-nodes'
import { EffectUnSubscriber } from './types'

class EffectObject {
    #nodes: Node[] = []
    #result: unknown
    #unsubEffect: EffectUnSubscriber

    constructor(action: () => unknown, parentNode: HTMLElement) {
        let init = false

        this.#unsubEffect = effect(() => {
            const res = action()

            if (init) {
                const frag = document.createDocumentFragment()
                const newNodes = []
                const list = Array.isArray(res) ? res : [res]

                for (const item of list) {
                    if (item instanceof HtmlTemplate) {
                        newNodes.push(...item.render(frag).nodes)
                    } else {
                        newNodes.push(renderData(item, frag))
                    }
                }

                this.#nodes = syncNodes(
                    this.#nodes,
                    newNodes.flat(),
                    parentNode
                )

                unmountItems(removedTemplates(this.#result, res))
            } else if (res instanceof HtmlTemplate) {
                !res.mounted && res.render(parentNode)
                this.#nodes = res.nodes
            } else if (Array.isArray(res)) {
                this.#nodes = res.flatMap((item) => {
                    if (item instanceof HtmlTemplate) {
                        return item.render(parentNode).nodes
                    }

                    return renderData(item, parentNode)
                })
            } else {
                this.#nodes = [renderData(res, parentNode!)]
            }

            init = true
            this.#result = res
        })
    }
    get nodes(): Node[] {
        return this.#nodes
    }

    unmount() {
        this.#unsubEffect()
        unmountItems(this.#result)
        for (const node of this.#nodes) {
            node.parentNode?.removeChild(node)
        }
    }
}

export class ReactiveNode {
    #nodes: Array<Node | ReactiveNode | HtmlTemplate | EffectObject> = []
    #text = ''
    #values: unknown[] = []
    #parentNode: HTMLElement | DocumentFragment | null = null

    constructor(text: string, values: unknown[]) {
        this.#text = text
        this.#values = values
    }

    get nodes(): Node[] {
        return this.#nodes.flatMap((item) =>
            item instanceof ReactiveNode ||
            item instanceof HtmlTemplate ||
            item instanceof EffectObject
                ? item.nodes
                : item
        )
    }

    get parentNode() {
        return this.#parentNode
    }

    get isConnected() {
        return this.#parentNode !== null
    }

    render(parentNode: HTMLElement) {
        if (parentNode !== this.#parentNode) {
            this.unmount()
            this.#parentNode = parentNode

            for (const part of parseDynamicRawValue(this.#text, this.#values)) {
                if (typeof part === 'string') {
                    this.#nodes.push(renderData(part, parentNode))
                } else if (typeof part.value === 'function') {
                    this.#nodes.push(
                        new EffectObject(
                            part.value as () => unknown,
                            parentNode
                        )
                    )
                } else if (
                    part.value instanceof HtmlTemplate ||
                    part.value instanceof ReactiveNode
                ) {
                    this.#nodes.push(part.value.render(parentNode))
                } else if (Array.isArray(part.value)) {
                    for (const item of part.value) {
                        if (
                            item instanceof HtmlTemplate ||
                            item instanceof ReactiveNode
                        ) {
                            this.#nodes.push(item.render(parentNode))
                        } else {
                            this.#nodes.push(renderData(item, parentNode))
                        }
                    }
                } else {
                    this.#nodes.push(renderData(part.value, parentNode))
                }
            }
        }

        return this
    }

    unmount() {
        if (this.isConnected) {
            for (const node of this.#nodes) {
                if (
                    node instanceof ReactiveNode ||
                    node instanceof HtmlTemplate ||
                    node instanceof EffectObject
                ) {
                    node.unmount()
                } else {
                    node.parentNode?.removeChild(node)
                }
            }
            this.#nodes = []
            this.#parentNode = null
        }
    }
}

function renderData(
    value: unknown,
    parentNode: HTMLElement | DocumentFragment
) {
    const node = document.createTextNode(String(value))
    parentNode.appendChild(node)
    return node
}

function unmountItems(item: unknown) {
    if (item instanceof ReactiveNode || item instanceof HtmlTemplate) {
        item.unmount()
    } else if (Array.isArray(item)) {
        for (const i of item) {
            unmountItems(i)
        }
    }
}

function removedTemplates(current: unknown, diff: unknown) {
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
