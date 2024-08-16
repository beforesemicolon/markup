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
const scheduledExecutions = new DoubleLinkedList<StateSubscriber>()

let executeTimer: NodeJS.Timeout

const executeScheduled = () => {
    clearTimeout(executeTimer)
    executeTimer = setTimeout(() => {
        for (const sub of scheduledExecutions) {
            sub()
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

    return Object.freeze([
        () => {
            const currentResolver = currentResolvers.tail
            if (
                typeof currentResolver?.sub === 'function' &&
                !subs.has(currentResolver?.sub)
            ) {
                subs.push(currentResolver.sub)
                currentResolver.unsubs.push(() =>
                    subs.remove(currentResolver?.sub)
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
                    scheduledExecutions.push(sub)
                }
                executeScheduled()
            }
        },
        () => {
            sub && subs.remove(sub)
        },
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
