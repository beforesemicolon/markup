import { Executable } from './types'
import { Doc } from './executable/Doc'
import { handleExecutable } from './executable/handle-executable'
import { parse } from '@beforesemicolon/html-parser'
import { Helper } from './helper'

// prevents others from creating functions that can be subscribed to
// and forces them to use state instead
const id = 'S' + Math.floor(Math.random() * 10000000)
type StateGetter<T> = () => T
type StateSetter<T> = (newVal: T | ((val: T) => T)) => void
type StateSubscriber = () => void
type StateUnSubscriber = () => void

export class HtmlTemplate {
    #htmlTemplate: string
    #nodes: Node[] = []
    #renderTarget: HTMLElement | ShadowRoot | Element | null = null
    #refs: Record<string, Set<Element>> = {}
    #subs: Set<() => () => void> = new Set()
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
     * the HTMLElement or ShadowRoot instance provided in the render method
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

    constructor(parts: TemplateStringsArray, values: unknown[]) {
        this.#values = values
        this.#htmlTemplate = parts
            .map((s, i) => {
                return i === parts.length - 1 ? s : s + `{{val${i}}}`
            })
            .join('')
            .trim()
    }

    /**
     * appends the template on the provided HTMLElement or ShadowRoot instance
     * @param elementToAttachNodesTo
     * @param force
     */
    render = (
        elementToAttachNodesTo: ShadowRoot | HTMLElement | Element | null,
        force = false
    ) => {
        if (
            elementToAttachNodesTo &&
            elementToAttachNodesTo !== this.renderTarget &&
            (force || !this.renderTarget) &&
            (elementToAttachNodesTo instanceof ShadowRoot ||
                elementToAttachNodesTo instanceof HTMLElement)
        ) {
            this.#renderTarget = elementToAttachNodesTo

            if (!this.#root) {
                this.#init(elementToAttachNodesTo as HTMLElement)
            }

            this.nodes.forEach((node) => {
                if (node.parentNode !== elementToAttachNodesTo) {
                    elementToAttachNodesTo.appendChild(node)
                }
            })
        }
    }

    /**
     * replaces the target element with the template nodes. Does not replace HEAD, BODY, HTML, and ShadowRoot elements
     * @param target
     */
    replace = (target: Node | HTMLElement | Element | HtmlTemplate | null) => {
        if (
            target instanceof HtmlTemplate ||
            (target instanceof HTMLElement &&
                !(
                    target instanceof ShadowRoot ||
                    target instanceof HTMLBodyElement ||
                    target instanceof HTMLHeadElement ||
                    target instanceof HTMLHtmlElement
                ))
        ) {
            let element: HTMLElement = target as HTMLElement

            if (target instanceof HtmlTemplate) {
                const renderedNode = target.nodes.find(
                    (n) => n instanceof HTMLElement && n.isConnected
                ) as HTMLElement

                if (renderedNode) {
                    element = renderedNode

                    target.nodes.forEach((n) => {
                        if (n !== renderedNode && n.isConnected) {
                            n.parentNode?.removeChild(n)
                        }
                    })
                } else {
                    return
                }
            }

            // only try to replace elements that are actually rendered anywhere
            if (!element.isConnected) {
                return
            }

            if (!this.#root) {
                this.#init(element)
            }

            const getFrag = () => {
                const frag = document.createDocumentFragment()
                frag.append(...this.nodes)

                return frag
            }

            if (typeof element.replaceWith === 'function') {
                element.replaceWith(getFrag())
            } else if (element.parentNode) {
                element.parentNode.replaceChild(getFrag(), element)
            } else {
                return
            }

            this.#renderTarget = element
            return
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
            this.#subs.forEach((cb) => cb())
        }
    }

    unmount() {
        this.#values.forEach((val) => {
            if (val instanceof HtmlTemplate) {
                val.unmount()
            }
        })
        this.nodes.forEach((n) => {
            if (n.parentNode) {
                n.parentNode.removeChild(n)
            }
        })
        this.#renderTarget = null
    }

    onUpdate(cb: () => () => void) {
        if (typeof cb === 'function') {
            this.#subs.add(cb)

            return () => {
                this.#subs.delete(cb)
            }
        }
    }

    #init(target: ShadowRoot | HTMLElement | Element) {
        if (target) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this

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
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            val[id](() => {
                                handleExecutable(
                                    node,
                                    self.#executablesByNode.get(
                                        node
                                    ) as Executable,
                                    self.#refs
                                )
                                self.#subs.forEach((cb) => cb())
                            }, id)
                        }
                    })

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.#executablesByNode.get(node)[type].push(e)
                })
            ) as DocumentFragment

            this.#nodes = Array.from(this.#root.childNodes)
        }
    }
}

/**
 * html template literal tag function
 * @param parts
 * @param values
 */
export const html = (parts: TemplateStringsArray, ...values: unknown[]) => {
    return new HtmlTemplate(parts, values)
}

class ValueGetSet<T> extends Array {
    // create a set of weak references instead of a weakSet
    // because we still need to iterate the references which weakSet does not allow
    #subs: Set<() => void> = new Set()

    constructor(val: T, sub?: StateSubscriber) {
        super(3) // sized array

        if (typeof sub === 'function') {
            this.#subs.add(sub)
        }

        this[0] = () => val
        this[1] = (newVal: T | ((val: T) => T)) => {
            val =
                typeof newVal === 'function'
                    ? (newVal as (val: T) => T)(val)
                    : newVal
            this.#subs.forEach((sub) => {
                sub()
            })
        }
        this[2] = () => {
            sub && this.#subs.delete(sub)
        }

        Object.defineProperty(this[0], id, {
            // ensure only HtmlTemplate can subscribe to this value
            value: (sub: () => void, subId: string) => {
                if (subId === id && typeof sub === 'function') {
                    this.#subs.add(sub)

                    return () => {
                        this.#subs.delete(sub)
                    }
                }
            },
        })

        Object.freeze(this)
    }
}

export const state = <T>(val: T, sub?: StateSubscriber) => {
    return new ValueGetSet<T>(val, sub) as unknown as [
        StateGetter<T>,
        StateSetter<T>,
        StateUnSubscriber,
    ]
}
