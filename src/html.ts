import {
    Executable,
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
} from './types'
import { Doc } from './executable/Doc'
import { handleExecutable } from './executable/handle-executable'
import { parse } from '@beforesemicolon/html-parser'
import { Helper } from './Helper'

// prevents others from creating functions that can be subscribed to
// and forces them to use state instead
const id = 'S' + Math.floor(Math.random() * 10000000)

export class HtmlTemplate {
    #htmlTemplate: string
    #nodes: Node[] = []
    #renderTarget: ShadowRoot | Element | null = null
    #refs: Record<string, Set<Element>> = {}
    #updateSubs: Set<() => void> = new Set()
    #mountSubs: Set<() => void> = new Set()
    #unmountSubs: Set<() => void> = new Set()
    #stateUnsubs: Set<() => void> = new Set()
    #executablesByNode: Map<Node, Executable> = new Map()
    #values: Array<unknown> = []
    #root: DocumentFragment | null = null

    /**
     * list of direct ChildNode from the template that got rendered
     */
    get nodes() {
        return this.#nodes.flatMap((node) => {
            const e = this.#executablesByNode.get(node)

            if (e?.content.length) {
                return Array.from(
                    new Set(
                        e.content.flatMap((v) =>
                            Array.isArray(v.renderedNodes)
                                ? v.renderedNodes
                                : [v.renderedNodes]
                        )
                    )
                )
            }

            return [node]
        })
    }

    /**
     * the Element or ShadowRoot instance provided in the render method
     */
    get renderTarget() {
        return this.#renderTarget
    }

    /**
     * map of DOM element references keyed by the name provided as the ref attribute value
     */
    get refs(): Record<string, Array<Element>> {
        const valueRefs = this.#values.reduce(
            (acc: Record<string, Array<Element>>, v) => {
                if (v instanceof HtmlTemplate) {
                    return { ...acc, ...v.refs }
                }

                return acc
            },
            {} as Record<string, Array<Element>>
        )

        return Object.freeze({
            ...valueRefs,
            ...Object.entries(this.#refs).reduce(
                (acc, [key, set]) => ({
                    ...acc,
                    [key]: Array.from(
                        new Set([...Array.from(set), ...(valueRefs[key] ?? [])])
                    ),
                }),
                {}
            ),
        })
    }

    constructor(parts: TemplateStringsArray | string[], values: unknown[]) {
        this.#values = values
        this.#htmlTemplate = parts
            .map((s, i) => {
                return i === parts.length - 1 ? s : s + `{{val${i}}}`
            })
            .join('')
            .trim()
    }

    /**
     * appends the template on the provided Element or ShadowRoot instance
     * @param elementToAttachNodesTo
     * @param force
     */
    render = (
        elementToAttachNodesTo: ShadowRoot | Element | null,
        force = false
    ) => {
        if (
            elementToAttachNodesTo &&
            elementToAttachNodesTo !== this.renderTarget &&
            (force || !this.renderTarget) &&
            (elementToAttachNodesTo instanceof ShadowRoot ||
                elementToAttachNodesTo instanceof Element)
        ) {
            this.#renderTarget = elementToAttachNodesTo
            let initialized = false

            if (!this.#root) {
                initialized = true
                this.#init(elementToAttachNodesTo as Element)
            }

            this.#nodes.forEach((node) => {
                if (node.parentNode !== elementToAttachNodesTo) {
                    elementToAttachNodesTo.appendChild(node)
                }
            })

            // this needs to happen after the nodes have been added again in order
            // to catch any updates done to things like state while the template
            // was unmounted
            if (!initialized && !this.#stateUnsubs.size) {
                this.#subscribeToState()
                this.update()
            }

            this.#broadcast(this.#mountSubs)
        }

        return this
    }

    /**
     * replaces the target element with the template nodes. Does not replace HEAD, BODY, HTML, and ShadowRoot elements
     * @param target
     */
    replace = (target: Node | Element | HtmlTemplate | null) => {
        if (
            target instanceof HtmlTemplate ||
            (target instanceof Element &&
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

            this.#renderTarget = element.parentNode as Element
            let initialized = false

            if (!this.#root) {
                initialized = true
                this.#init(element)
            }

            const frag = document.createDocumentFragment()
            frag.append(...this.#nodes)
            element.parentNode?.replaceChild(frag, element)

            // this needs to happen after the nodes have been added again in order
            // to catch any updates done to things like state while the template
            // was unmounted
            if (!initialized && !this.#stateUnsubs.size) {
                this.#subscribeToState()
                this.update()
            } else {
                this.#broadcast(this.#mountSubs)
            }

            // only need to unmount the template nodes
            // if the target is not a template, it will be automatically removed
            // when replaceChild is called above.
            if (target instanceof HtmlTemplate) {
                target.unmount()
            }

            return this
        }

        throw new Error(`Invalid replace target element. Received ${target}`)
    }

    /**
     * updates the already rendered DOM Nodes with the update values
     */
    update() {
        // only update if the nodes were already rendered and there are actual values
        if (this.renderTarget && this.#executablesByNode.size) {
            this.#executablesByNode.forEach((executable, node) => {
                handleExecutable(node, executable, this.#refs)
            })
            this.#broadcast(this.#updateSubs)
        }
    }

    unmount() {
        if (this.#renderTarget) {
            this.#nodes.forEach((n) => {
                if (n.parentNode) {
                    n.parentNode.removeChild(n)
                }
            })
            this.#renderTarget = null
            this.unsubscribeFromStates()
            this.#broadcast(this.#unmountSubs)
        }
    }

    unsubscribeFromStates = () => {
        this.#stateUnsubs.forEach((unsub) => {
            unsub()
        })
        this.#stateUnsubs.clear()
    }

    onUpdate(cb: () => void) {
        return this.#sub(cb, this.#updateSubs)
    }

    onMount(cb: () => void) {
        return this.#sub(cb, this.#mountSubs)
    }

    onUnmount(cb: () => void) {
        return this.#sub(cb, this.#unmountSubs)
    }

    #sub(cb: () => void, set: Set<() => void>) {
        if (typeof cb === 'function') {
            set.add(cb)
        }

        return this
    }

    #broadcast(set: Set<() => void>) {
        set.forEach((sub) => setTimeout(sub, 0))
    }

    #init(target: ShadowRoot | Element) {
        if (target) {
            this.#root = parse(
                this.#htmlTemplate,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                Doc(this.#values, this.#refs, (node, e, type) => {
                    if (!this.#executablesByNode.has(node)) {
                        this.#executablesByNode.set(node, {
                            content: [],
                            events: [],
                            directives: [],
                            attributes: [],
                        })
                    }
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.#executablesByNode.get(node)[type].push(e)
                })
            ) as DocumentFragment
            this.#subscribeToState()
            this.#nodes = Array.from(this.#root.childNodes)
        }
    }

    #subscribeToState() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this

        Array.from(this.#executablesByNode.entries()).forEach(
            ([node, { content, directives, attributes, events }]) => {
                ;[...content, ...directives, ...events, ...attributes].forEach(
                    (e) => {
                        // subscribe to any state value used in the node
                        e.parts.forEach(function sub(val: unknown) {
                            if (val instanceof Helper) {
                                val.args.forEach(sub)
                            } else if (
                                typeof val === 'function' &&
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                typeof val[id] === 'function'
                            ) {
                                const nodeExec =
                                    self.#executablesByNode.get(node)

                                if (nodeExec) {
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    const unsub = val[id](() => {
                                        handleExecutable(
                                            node,
                                            nodeExec,
                                            self.#refs
                                        )
                                        self.#updateSubs.forEach((cb) => cb())
                                    }, id)
                                    self.#stateUnsubs.add(unsub)
                                }
                            }
                        })
                    }
                )
            }
        )
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
) => {
    return new HtmlTemplate(parts, values)
}

export const state = <T>(val: T, sub?: StateSubscriber) => {
    const subs: Set<() => void> = new Set()
    const arr = new Array(3) as [
        StateGetter<T>,
        StateSetter<T>,
        StateUnSubscriber,
    ]

    if (typeof sub === 'function') {
        subs.add(sub)
    }

    arr[0] = () => val
    arr[1] = (newVal: T | ((val: T) => T)) => {
        val =
            typeof newVal === 'function'
                ? (newVal as (val: T) => T)(val)
                : newVal
        subs.forEach((sub) => {
            sub()
        })
    }
    arr[2] = () => {
        sub && subs.delete(sub)
    }

    Object.defineProperty(arr[0], id, {
        // ensure only HtmlTemplate can subscribe to this value
        value: (sub: () => void, subId: string) => {
            if (subId === id && typeof sub === 'function') {
                subs.add(sub)
            }

            return () => {
                subs.delete(sub)
            }
        },
    })

    Object.freeze(arr)

    return arr
}
