import { Doc } from './Doc'
import { parse } from '@beforesemicolon/html-parser/dist/parse'
import { EffectUnSubscriber } from './types'
import { ReactiveNode } from './ReactiveNode'

export class HtmlTemplate {
    #htmlTemplate: string
    #mountables: Array<ReactiveNode | HtmlTemplate> = []
    #refs: Record<string, Set<Element>> = {}
    #effectUnsubs: Set<EffectUnSubscriber> = new Set()
    #values: Array<unknown> = []
    #mounted = false
    #mountSub: (() => void | (() => void)) | undefined = undefined
    #unmountSub: (() => void) | undefined = undefined
    #updateSub: (() => void) | undefined = undefined
    #markers = [document.createTextNode(''), document.createTextNode('')]

    /**
     * the Element or ShadowRoot instance provided in the render method
     */
    get parentNode(): ParentNode | null {
        return this.#markers[0].parentNode
    }

    get childNodes() {
        const nodes = []

        let node = this.#markers[0].nextSibling
        while (node && node !== this.#markers[1]) {
            nodes.push(node)
            node = node.nextSibling
        }
        return nodes
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

    /**
     * @deprecated
     * internally used nodes to mark the beginning and end of nodes belonging to this template.
     *
     * DO NOT USE or RELY on IT!
     */
    get __MARKERS__() {
        return this.#markers
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
            | DocumentFragment
    ) {
        if (
            elementToAttachNodesTo &&
            elementToAttachNodesTo !== this.parentNode &&
            (elementToAttachNodesTo instanceof ShadowRoot ||
                elementToAttachNodesTo instanceof Element ||
                elementToAttachNodesTo instanceof DocumentFragment)
        ) {
            if (this.isConnected) {
                elementToAttachNodesTo.append(
                    this.#markers[0],
                    ...this.childNodes,
                    this.#markers[1]
                )
            } else {
                this.#init('render', elementToAttachNodesTo)
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
            let element = target

            if (target instanceof HtmlTemplate) {
                element = document.createTextNode('') as Node
                target.__MARKERS__[0].parentNode?.insertBefore(
                    element,
                    target.__MARKERS__[0]
                )
                target.unmount()
            }

            // only try to replace elements that are actually rendered anywhere
            if (!element) {
                return
            }

            if (this.isConnected) {
                const frag = document.createDocumentFragment()
                frag.append(
                    this.#markers[0],
                    ...this.childNodes,
                    this.#markers[1]
                )
                element?.parentNode?.replaceChild(frag, element as Node)
            } else {
                this.#init('replace', element as Node)
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

            for (const item of this.#mountables) {
                item.unmount()
            }

            let node = this.#markers[0].nextSibling

            while (node && node !== this.#markers[1]) {
                const next = node.nextSibling
                node.remove()
                node = next
            }

            this.#markers[0].remove()
            this.#markers[1].remove()
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

    #init(actionType: 'render' | 'replace', element: Node) {
        const frag = parse(
            this.#htmlTemplate,
            // @ts-expect-error DocType not DocumentLike
            Doc(this.#values, this.#refs, (item) => {
                if (
                    item instanceof ReactiveNode ||
                    item instanceof HtmlTemplate
                ) {
                    this.#mountables.push(item)

                    // the root node will be a document fragment which means
                    // item will be a direct child
                    if (
                        item instanceof ReactiveNode &&
                        item.parentNode instanceof DocumentFragment
                    ) {
                        item.updateParentReference(element as HTMLElement)
                    }

                    // only subscribe to direct child ReactiveNode update
                    // to update current nodes
                    if (item instanceof ReactiveNode) {
                        item.onUpdate(() => {
                            this.#updateSub?.()
                        })
                    }
                } else {
                    this.#effectUnsubs.add(item)
                }
            })
        )

        // @ts-expect-error DocumentFragLike real Node is available through __self__ property
        const realFrag = frag.__self__ as DocumentFragment

        realFrag.prepend(this.#markers[0])
        realFrag.append(this.#markers[1])

        if (actionType === 'replace') {
            element?.parentNode?.replaceChild(realFrag, element)
        } else {
            element.appendChild(realFrag)
        }

        this.#mounted = true
        const res = this.#mountSub?.()

        if (typeof res === 'function') {
            this.#unmountSub = res
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
