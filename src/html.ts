import { Doc } from './Doc'
import { parse } from '@beforesemicolon/html-parser/dist/parse'
import { EffectUnSubscriber } from './types'
import { ReactiveNode } from './ReactiveNode'
import { toNodes } from './utils/to-nodes'

export class HtmlTemplate {
    #htmlTemplate: string
    #nodes: Array<Node | HtmlTemplate | ReactiveNode> = []
    #childNodes: Node[] = []
    #mountables: Array<ReactiveNode | HtmlTemplate> = []
    #refs: Record<string, Set<Element>> = {}
    #effectUnsubs: Set<EffectUnSubscriber> = new Set()
    #values: Array<unknown> = []
    #mounted = false
    #mountSub: (() => void | (() => void)) | undefined = undefined
    #unmountSub: (() => void) | undefined = undefined
    #updateSub: (() => void) | undefined = undefined
    #parent: ShadowRoot | HTMLElement | Element | DocumentFragment | null = null

    /**
     * list of direct ChildNode from the template that got rendered
     */
    get nodes(): Node[] {
        return this.#childNodes
    }

    /**
     * the Element or ShadowRoot instance provided in the render method
     */
    get parentNode(): ParentNode | null {
        return this.#parent
    }

    /**
     * map of DOM element references keyed by the name provided as the ref attribute value
     */
    get refs(): Record<string, Array<Element>> {
        const childRefs = this.#mountables.reduce((acc, item) => {
            if (item instanceof HtmlTemplate || item instanceof ReactiveNode) {
                return {
                    ...acc,
                    ...item.refs,
                }
            }

            return acc
        }, {})

        return Object.freeze({
            ...childRefs,
            ...Object.entries(this.#refs).reduce(
                (acc, [key, set]) => ({
                    ...acc,
                    [key]: Array.from(new Set(Array.from(set))),
                }),
                {}
            ),
        })
    }

    get isConnected() {
        return this.#mounted
    }

    constructor(parts: TemplateStringsArray | string[], values: unknown[]) {
        this.#values = values
        this.#htmlTemplate = parts
            .map((s, i) => {
                return i === parts.length - 1 ? s : s + `$val${i}`
            })
            .join('')
            .trim()
    }

    /**
     * appends the template on the provided Element or ShadowRoot instance
     * @param elementToAttachNodesTo
     * @param force
     */
    render(
        elementToAttachNodesTo:
            | ShadowRoot
            | HTMLElement
            | Element
            | DocumentFragment,
        force = false
    ) {
        if (
            elementToAttachNodesTo &&
            elementToAttachNodesTo !== this.#parent &&
            (force || !this.#parent) &&
            (elementToAttachNodesTo instanceof ShadowRoot ||
                elementToAttachNodesTo instanceof Element ||
                elementToAttachNodesTo instanceof DocumentFragment)
        ) {
            if (force) {
                this.unmount()
            }
            this.#parent = elementToAttachNodesTo
            this.#init()
            const res = this.#mountSub?.()

            if (typeof res === 'function') {
                this.#unmountSub = res
            }
        }

        return this
    }

    /**
     * replaces the target element with the template nodes. Does not replace HEAD, BODY, HTML, and ShadowRoot elements
     * @param target
     */
    replace(target: Node | HtmlTemplate) {
        if (
            target instanceof HtmlTemplate ||
            (target instanceof Node &&
                !(
                    target instanceof ShadowRoot ||
                    target instanceof HTMLBodyElement ||
                    target instanceof HTMLHeadElement ||
                    target instanceof HTMLHtmlElement
                ))
        ) {
            let element = target as Element

            if (target instanceof HtmlTemplate) {
                element = target.nodes.find((n) => n.isConnected) as Element
            }

            // only try to replace elements that are actually rendered anywhere
            if (!element || !element.isConnected) {
                return
            }

            this.#parent = element.parentNode as Element
            this.#init(true, element)

            // since the nodes of the template are being replaced
            // we can go ahead an unmount it so it cleans up properly
            if (target instanceof HtmlTemplate) {
                target.unmount()
            }

            return this
        }

        throw new Error(`Invalid replace target element. Received ${target}`)
    }

    unmount() {
        if (this.isConnected) {
            for (const effectUnsub of this.#effectUnsubs) {
                effectUnsub()
            }

            for (const node of this.#nodes) {
                if (
                    node instanceof ReactiveNode ||
                    node instanceof HtmlTemplate
                ) {
                    node.unmount()
                } else {
                    node.parentNode?.removeChild(node)
                }
            }

            this.#parent = null
            this.#nodes = []
            this.#childNodes = []
            this.#mountables = []
            this.#mounted = false
            this.#unmountSub?.()
        }
    }

    onMount(cb: () => void) {
        this.#mountSub = cb
        return this
    }

    onUpdate(cb: () => void) {
        this.#updateSub = cb
        return this
    }

    /**
     * Updates the parentNode
     *
     * !! WARNING !!
     * This should be used in case HtmlTemplate was rendered in a DocumentFragment
     * and then this DocumentFragment was appended to another Element from which case
     * this will help HtmlTemplate update its parent reference to the correct one without
     * having to render again
     *
     * @param newParent
     */
    updateParentReference(newParent: HTMLElement | Element) {
        if (newParent && newParent instanceof Node) {
            this.#parent = newParent
        }
    }

    #init(replace = false, element: Element | null = null) {
        if (this.#parent) {
            const frag = parse(
                this.#htmlTemplate,
                // @ts-expect-error DocType not DocumentLike
                Doc(this.#values, this.#refs, (item) => {
                    if (
                        item instanceof ReactiveNode ||
                        item instanceof HtmlTemplate
                    ) {
                        this.#mountables.push(item)
                        const isDirectChild =
                            item.parentNode instanceof DocumentFragment

                        // the root node will be a document fragment which means
                        // item will be a direct child
                        if (isDirectChild) {
                            item.updateParentReference(
                                this.#parent as HTMLElement
                            )
                        }

                        // only subscribe to direct child ReactiveNode update
                        // to update current nodes
                        if (item instanceof ReactiveNode) {
                            item.onUpdate(() => {
                                if (this.#mounted) {
                                    this.#childNodes = toNodes(this.#nodes)
                                }
                                this.#updateSub?.()
                            })
                        }
                    } else {
                        this.#effectUnsubs.add(item)
                    }
                })
            )
            if (replace) {
                // @ts-expect-error DocumentFragLike real Node is available through __self__ property
                element.parentNode?.replaceChild(frag.__self__, element)
            } else {
                // @ts-expect-error DocumentFragLike real Node is available through __self__ property
                this.#parent.appendChild(frag.__self__)
            }
            // @ts-expect-error DocumentFragLike __nodes__ will expose Node and ReactiveNode list
            this.#nodes = frag.__nodes__
            this.#childNodes = toNodes(this.#nodes)
            this.#mounted = true
        }
    }
}

/**
 * html template literal tag function
 * @param parts
 * @param values
 */
export const html = (
    parts: TemplateStringsArray | string[],
    ...values: unknown[]
) => new HtmlTemplate(parts, values)
