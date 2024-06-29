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
    unsubs: Set<EffectUnSubscriber>
    children: Set<Resolver>
    clear: () => void
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
                currentResolver.unsubs.add(() =>
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
                for (const sub of subs) {
                    sub()
                }
            }
        },
        () => {
            sub && subs.delete(sub)
        },
    ])
}

export const effect = <T>(sub: EffectSubscriber<T>) => {
    if (typeof sub === 'function') {
        let value: T | undefined
        const res: Resolver = {
            sub() {
                const parent = currentResolvers.at(-1) as Resolver

                if (parent && parent !== res) {
                    parent.children.add(res)
                }

                currentResolvers.push(res)
                try {
                    value = sub(value)
                } finally {
                    currentResolvers.pop()
                }
            },
            unsubs: new Set(),
            children: new Set(),
            clear() {
                for (const child of this.children) {
                    child.clear()
                }
                for (const unsub of this.unsubs) {
                    unsub()
                }
                this.children.clear()
                this.unsubs.clear()
                value = undefined
            },
        }

        res.sub()

        return () => res.clear()
    }

    throw new Error(`effect: callback must be a function`)
}
