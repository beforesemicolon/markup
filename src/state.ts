import {
    EffectSubscriber,
    EffectUnSubscriber,
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
} from './types'

interface Resolver {
    sub: StateSubscriber
    unsubs: EffectUnSubscriber[]
}

const currentResolvers: Resolver[] = []

export const state = <T>(
    value: T,
    sub?: StateSubscriber
): Readonly<[StateGetter<T>, StateSetter<T>, StateUnSubscriber]> => {
    let lastValue = value
    const subs: Set<StateSubscriber> = new Set(),
        broadcast = () => {
            if (value !== lastValue) {
                lastValue = value
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
                value = updatedValue
                setTimeout(broadcast)
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
    sub: EffectSubscriber,
    {
        fn,
    }: {
        fn?: typeof requestAnimationFrame | typeof setTimeout
    } = {}
) {
    if (typeof sub === 'function') {
        let value: unknown
        const subWrapper: StateSubscriber = () => {
            value = sub(value)
        }
        const res: Resolver = { sub: subWrapper, unsubs: [] },
            handler = () => {
                currentResolvers.push(res)
                try {
                    subWrapper()
                } finally {
                    currentResolvers.pop()
                }
            }

        ;(fn ?? handler)(handler)

        return () => res.unsubs.forEach((unsub) => unsub())
    }

    throw new Error(`effect: callback must be a function`)
}

export function effect(cb: StateSubscriber) {
    return __effect(cb)
}

export function rafEffect(cb: StateSubscriber) {
    return __effect(cb, { fn: requestAnimationFrame })
}
