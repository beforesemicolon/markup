import {
    EffectSubscriber,
    EffectUnSubscriber,
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
} from './types.ts'
import { DoubleLinkedList } from './DoubleLinkedList.ts'

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

let flushPending = false

const flushScheduledExecutions = () => {
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
}

const scheduleExecution = () => {
    if (flushPending) return
    flushPending = true
    queueMicrotask(() => {
        flushPending = false
        flushScheduledExecutions()
    })
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
                if (!subs.size) {
                    return updatedValue
                }
                scheduledExecutions.push(subs)
                scheduleExecution()
            }

            return updatedValue
        },
        () => removeSub(sub),
    ])
}

export const effect = <T>(sub: EffectSubscriber<T>) => {
    if (typeof sub === 'function') {
        let value: T | undefined
        let isRunning = false
        let pendingReRun = false

        const run = () => {
            if (isRunning) {
                pendingReRun = true
                return
            }

            isRunning = true

            const parent = currentResolvers.tail

            if (parent && parent !== res) {
                parent.children.push(res)
            }

            currentResolvers.push(res)

            try {
                value = sub(value)
            } catch (e) {
                console.error(e)
            } finally {
                currentResolvers.pop()
                isRunning = false

                if (pendingReRun) {
                    pendingReRun = false
                    queueMicrotask(run)
                }
            }
        }

        const res: Resolver = {
            sub: run,
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

        run()

        return () => res.clear()
    }

    throw new Error(`effect: callback must be a function`)
}
