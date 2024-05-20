import {
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
} from './types'
import type { DynamicValueResolver } from './dynamic-value/DynamicValueResolver'
import { Doc } from './Doc'
import { parse } from '@beforesemicolon/html-parser/dist/parse'

// prevents others from creating functions that can be subscribed to
// and forces them to use state instead
const id = 'S' + Math.floor(Math.random() * 10000000);
let currentResolver: StateSubscriber | null = null;
let currentResolverUnsubscriber: StateUnSubscriber | null = null;
const setCurrentResolver = (fn: StateSubscriber) => {
    currentResolver = fn;
}

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
            this.#stateUnsubs.add(onStateUpdate(() => {
                dv.resolve(this.#refs);
                this.mounted && this.#broadcast(this.#updateSubs)
            }))
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

    // #subscribeToState() {
    //     // eslint-disable-next-line @typescript-eslint/no-this-alias
    //     const self = this
    //
    //     this.#dynamicValues.forEach((dv) => {
    //         // subscribe to any state value used in the node
    //         ;(Array.isArray(dv.value) ? dv.value : [dv.value]).forEach(
    //             function sub(val: unknown) {
    //                 if (val instanceof Helper) {
    //                     // subscribe to possible state value provided as argument to helpers
    //                     val.args.forEach(sub)
    //                 } else if (
    //                     typeof val === 'function' &&
    //                     // @ts-expect-error state value exposes function accessible by this global id
    //                     typeof val[id] === 'function'
    //                 ) {
    //                     // @ts-expect-error state value exposes function accessible by this global id
    //                     const unsub = val[id](() => {
    //                         dv.resolve(self.#refs)
    //                         self.#updateSubs.forEach((cb) => cb())
    //                     }, id)
    //                     self.#stateUnsubs.add(unsub)
    //                 }
    //             }
    //         )
    //     })
    // }
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

// export const state = <T>(
//     val: T,
//     sub?: StateSubscriber
// ): Readonly<[StateGetter<T>, StateSetter<T>, StateUnSubscriber]> => {
//     const subs: Set<() => void> = new Set()
//     const getter = () => val
//
//     if (typeof sub === 'function') {
//         subs.add(sub)
//     }
//
//     Object.defineProperty(getter, id, {
//         // ensure only HtmlTemplate can subscribe to this value
//         value: (sub: () => void, subId: string) => {
//             if (subId === id && typeof sub === 'function') {
//                 subs.add(sub)
//             }
//
//             return () => {
//                 subs.delete(sub)
//             }
//         },
//     })
//
//     return Object.freeze([
//         getter,
//         (newVal: T | ((val: T) => T)) => {
//             val =
//                 typeof newVal === 'function'
//                     ? (newVal as (val: T) => T)(val)
//                     : newVal
//             subs.forEach((sub) => {
//                 sub()
//             })
//         },
//         () => {
//             sub && subs.delete(sub)
//         },
//     ])
// }

export function onStateUpdate(sub: StateSubscriber): StateUnSubscriber {
    if (typeof sub === 'function') {
        currentResolver = sub;
        sub();
        currentResolver = null;
    }

    return currentResolverUnsubscriber ?? (() => {})
}

export const state = <T>(initialValue: T, sub?: StateSubscriber): Readonly<[StateGetter<T>, StateSetter<T>, StateUnSubscriber]> => {
    const subs: Set<StateSubscriber> = new Set();

    if (typeof sub === 'function') {
        subs.add(sub)
    }

    return Object.freeze([
        () => {
            if(typeof currentResolver === 'function' && !subs.has(currentResolver)) {
                subs.add(currentResolver)
                const res = currentResolver;
                currentResolverUnsubscriber = () => {
                    subs.delete(res)
                }
            }
            return initialValue;
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