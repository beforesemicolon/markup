import {
    EffectSubscriber,
    EffectUnSubscriber,
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
} from './types'
import { DoubleLinkedList } from './DoubleLinkedList'

interface Resolver {
    sub: StateSubscriber
    unsubs: DoubleLinkedList<EffectUnSubscriber>
    children: DoubleLinkedList<Resolver>
    clear: () => void
}

const currentResolvers = new DoubleLinkedList<Resolver>()
// will contain unique subscribers so if many states use the same subscribers
// they will only be called once if all those states update at once
// and it needs to be dynamic in case the sub lists are cleared due to unmount
const scheduledExecutions = new DoubleLinkedList<
    DoubleLinkedList<StateSubscriber>
>()

let executeTimer: NodeJS.Timeout

const executeScheduled = () => {
    clearTimeout(executeTimer)
    executeTimer = setTimeout(() => {
        const visited = new DoubleLinkedList<StateSubscriber>()

        for (const subs of scheduledExecutions) {
            for (const sub of subs) {
                if (!visited.has(sub)) {
                    visited.push(sub)
                    sub()
                }
            }
        }

        scheduledExecutions.clear()
    }, 0)
}

export const state = <T>(
    value: T,
    sub?: StateSubscriber
): Readonly<[StateGetter<T>, StateSetter<T>, StateUnSubscriber]> => {
    const subs: DoubleLinkedList<StateSubscriber> = new DoubleLinkedList()

    if (typeof sub === 'function') {
        subs.push(sub)
    }

    const removeSub = (s?: StateSubscriber) => {
        s && subs.remove(s)
        if (!subs.size) {
            scheduledExecutions.remove(subs)
        }
    }

    return Object.freeze([
        () => {
            const currentResolver = currentResolvers.tail
            if (
                typeof currentResolver?.sub === 'function' &&
                !subs.has(currentResolver?.sub)
            ) {
                subs.push(currentResolver.sub)
                currentResolver.unsubs.push(() =>
                    removeSub(currentResolver?.sub)
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
                scheduledExecutions.push(subs)
                executeScheduled()
            }
        },
        () => removeSub(sub),
    ])
}

export const effect = <T>(sub: EffectSubscriber<T>) => {
    if (typeof sub === 'function') {
        let value: T | undefined
        const res: Resolver = {
            sub() {
                const parent = currentResolvers.tail

                if (parent && parent !== res) {
                    parent.children.push(res)
                }

                currentResolvers.push(res)
                try {
                    value = sub(value)
                } finally {
                    currentResolvers.pop()
                }
            },
            unsubs: new DoubleLinkedList(),
            children: new DoubleLinkedList(),
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
