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
            return value
        },
        (newVal: T | ((val: T) => T)) => {
            const updatedValue =
                typeof newVal === 'function'
                    ? (newVal as (val: T) => T)(value)
                    : newVal

            if (updatedValue !== value) {
                value = updatedValue
                subs.forEach((sub) => sub())
            }
        },
        () => {
            sub && subs.delete(sub)
        },
    ])
}

export const effect = <T>(
    sub: EffectSubscriber<T>,
    {
        fn,
    }: {
        fn?: typeof requestAnimationFrame | typeof setTimeout
    } = {}
) => {
    if (typeof sub === 'function') {
        let value: T | undefined
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
