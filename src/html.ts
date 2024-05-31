import {
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
} from './types'
import type { DynamicValueResolver } from './dynamic-value/DynamicValueResolver'
import { Doc } from './Doc'
import { parse } from '@beforesemicolon/html-parser/dist/parse'

interface Resolver {
    sub: StateSubscriber
    unsubs: StateUnSubscriber[]
}

const currentResolvers: Resolver[] = []

export class HtmlTemplate {
    #htmlTemplate: string
    #nodes: Array<Node | DynamicValueResolver> = []
    #renderTarget: ShadowRoot | Element | DocumentFragment | null = null
    #refs: Record<string, Set<Element>> = {}
    #updateSubs: Set<() => void> = new Set()
    #mountSubs: Set<() => void> = new Set()
    #unmountSubs: Set<() => void> = new Set()
    #stateUnsubs: Set<() => void> = new Set()
    #dynamicValues: DynamicValueResolver[] = []
    #values: Array<unknown> = []
    #mounted = false

    /**
     * list of direct ChildNode from the template that got rendered
     */
    get nodes() {
        return Array.from(
            new Set(
                this.#nodes.flatMap((n) =>
                    n instanceof Node ? [n] : n.renderedNodes
                )
            )
        )
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

    get mounted() {
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
    render = (
        elementToAttachNodesTo: ShadowRoot | Element | DocumentFragment,
        force = false
    ) => {
        if (
            elementToAttachNodesTo &&
            elementToAttachNodesTo !== this.renderTarget &&
            (force || !this.renderTarget) &&
            (elementToAttachNodesTo instanceof ShadowRoot ||
                elementToAttachNodesTo instanceof Element ||
                elementToAttachNodesTo instanceof DocumentFragment)
        ) {
            if (force) {
                this.unmount()
            }
            this.#renderTarget = elementToAttachNodesTo

            elementToAttachNodesTo.appendChild(this.#init())
            this.#mounted = true
            this.#broadcast(this.#mountSubs)
        }

        return this
    }

    /**
     * replaces the target element with the template nodes. Does not replace HEAD, BODY, HTML, and ShadowRoot elements
     * @param target
     */
    replace = (target: Node | HtmlTemplate) => {
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

            this.#renderTarget = element.parentNode as Element
            element.parentNode?.replaceChild(this.#init(), element)

            this.#mounted = true
            this.#broadcast(this.#mountSubs)

            // since the nodes of the template are being replaced
            // we can go ahead an unmount it so it cleans up properly
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
        if (this.renderTarget && this.#dynamicValues.length) {
            this.#dynamicValues.forEach((dv) => dv.resolve(this.#refs))
            this.#broadcast(this.#updateSubs)
        }
    }

    unmount() {
        if (this.#renderTarget && this.#mounted) {
            this.#dynamicValues.forEach((dv) => {
                dv.unmount()
            })
            this.nodes.forEach((n) => {
                if (n.parentNode) {
                    n.parentNode.removeChild(n)
                }
            })
            this.#renderTarget = null
            this.#dynamicValues = []
            this.#mounted = false
            this.#nodes = []
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

    #init() {
        const fragLike = parse(
            this.#htmlTemplate,
            // @ts-expect-error this is a Document like object
            Doc(this.#values, this.#refs, (dv) => this.#dynamicValues.push(dv))
        ) as DocumentFragment
        // this.#subscribeToState()
        const renderedNodeDvMapping = new WeakMap()
        this.#dynamicValues.forEach((dv) => {
            this.#stateUnsubs.add(
                effect(() => {
                    dv.resolve(this.#refs)
                    this.mounted && this.#broadcast(this.#updateSubs)
                })
            )
            dv.renderedNodes.forEach((n) => renderedNodeDvMapping.set(n, dv))
        })
        this.#nodes = Array.from(
            fragLike.childNodes,
            (n) => renderedNodeDvMapping.get(n) ?? n
        )
        const frag = document.createDocumentFragment()
        frag.append(...fragLike.childNodes)
        return frag
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

export function effect(sub: StateSubscriber): StateUnSubscriber {
    if (typeof sub !== 'function') {
        throw new Error(`onStateUpdate: callback must be a function`)
    }
    const res: Resolver = { sub, unsubs: [] }

    currentResolvers.push(res)

    // its important to clear the "currentResolvers"
    // therefore, "finally" must be used
    try {
        sub()
    } finally {
        currentResolvers.pop()
    }

    return () => {
        res.unsubs.forEach((unsub) => unsub())
    }
}

export const state = <T>(
    initialValue: T,
    sub?: StateSubscriber
): Readonly<[StateGetter<T>, StateSetter<T>, StateUnSubscriber]> => {
    const subs: Set<StateSubscriber> = new Set()

    if (typeof sub === 'function') {
        subs.add(sub)
    }

    return Object.freeze([
        () => {
            const currentResolver = currentResolvers.at(-1) as Resolver
            if (
                typeof currentResolver?.sub === 'function' &&
                !subs.has(currentResolver?.sub)
            ) {
                subs.add(currentResolver.sub)
                currentResolver.unsubs.push(() =>
                    subs.delete(currentResolver?.sub)
                )
            }
            return initialValue
        },
        (newVal: T | ((val: T) => T)) => {
            initialValue =
                typeof newVal === 'function'
                    ? (newVal as (val: T) => T)(initialValue)
                    : newVal
            subs.forEach((sub) => {
                sub()
            })
        },
        () => {
            sub && subs.delete(sub)
        },
    ])
}
