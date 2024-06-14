import {
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
} from './types'
import { ActionQueue } from './ActionQueue'

interface Resolver {
    sub: StateSubscriber
    unsubs: StateUnSubscriber[]
}

const currentResolvers: Resolver[] = []

export const state = <T>(
    value: T,
    sub?: StateSubscriber
): Readonly<[StateGetter<T>, StateSetter<T>, StateUnSubscriber]> => {
    let lastValue = value
    const subs: Set<StateSubscriber> = new Set(),
        Q = new ActionQueue(),
        broadcast = () => {
            if (value !== lastValue) {
                subs.forEach((sub) => sub())
            }
        }

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
            return value
        },
        (newVal: T | ((val: T) => T)) => {
            const updatedValue =
                typeof newVal === 'function'
                    ? (newVal as (val: T) => T)(value)
                    : newVal

            if (updatedValue !== value) {
                lastValue = value
                value = updatedValue
                Q.set(broadcast)
            }
        },
        () => {
            sub && subs.delete(sub)
        },
    ])
}

// using setTimeout will defer execution and not block everything else
// because the effect needs to call the cb at least once to register to state
// we can also make setTimeout callback fn, async so we can handle async effect cb
function __effect(
    sub: StateSubscriber,
    {
        fn,
    }: {
        fn?: typeof requestAnimationFrame | typeof setTimeout
    } = {}
) {
    if (typeof sub === 'function') {
        const res: Resolver = { sub, unsubs: [] },
            handler = async () => {
                currentResolvers.push(res)
                try {
                    await sub()
                } finally {
                    currentResolvers.pop()
                }
            }

        if (fn) {
            fn(handler)
        } else {
            handler()
        }

        return () => {
            res.unsubs.forEach((unsub) => unsub())
        }
    }

    throw new Error(`effect: callback must be a function`)
}

export function effect(cb: StateSubscriber) {
    return __effect(cb)
}

export function rafEffect(cb: StateSubscriber) {
    return __effect(cb, { fn: requestAnimationFrame })
}
