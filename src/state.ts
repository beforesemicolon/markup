import {
    EffectSubscriber,
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
} from './types.ts'
import { DoubleLinkedList } from './DoubleLinkedList.ts'
import {
    EffectResolver,
    getCurrentResolver,
    popCurrentResolver,
    pushCurrentResolver,
} from './effect-context.ts'

const scheduledExecutions = new Set<StateSubscriber>()

let flushPending = false

const flushScheduledExecutions = () => {
    const visited = new Set<StateSubscriber>()

    for (const sub of scheduledExecutions) {
        scheduledExecutions.delete(sub)

        if (visited.has(sub)) continue

        visited.add(sub)
        sub()
    }
}

const scheduleExecution = () => {
    if (flushPending) return
    flushPending = true
    queueMicrotask(() => {
        try {
            flushScheduledExecutions()
        } finally {
            flushPending = false
            if (scheduledExecutions.size) scheduleExecution()
        }
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

    const removeSub = (s?: StateSubscriber, cancelScheduled = false) => {
        if (!s) return
        subs.remove(s)
        if (cancelScheduled) scheduledExecutions.delete(s)
    }

    return Object.freeze([
        () => {
            const currentResolver = getCurrentResolver()
            if (
                typeof currentResolver?.sub === 'function' &&
                !subs.has(currentResolver.sub)
            ) {
                subs.push(currentResolver.sub)
                currentResolver.unsubs.push(() =>
                    removeSub(currentResolver.sub)
                )
            }
            return value
        },
        (newVal: T | ((val: T) => T)) => {
            const updatedValue =
                typeof newVal === 'function'
                    ? (newVal as (val: T) => T)(value)
                    : newVal

            if (!Object.is(updatedValue, value)) {
                value = updatedValue
                for (const subscriber of subs) {
                    scheduledExecutions.add(subscriber)
                }
                if (scheduledExecutions.size) scheduleExecution()
            }

            return updatedValue
        },
        () => removeSub(sub, true),
    ])
}

export const effect = <T>(sub: EffectSubscriber<T>) => {
    if (typeof sub !== 'function') {
        throw new Error(`effect: callback must be a function`)
    }

    let value: T | undefined
    let isRunning = false
    let pendingReRun = false

    const parent = getCurrentResolver()
    const childIndex = parent ? parent.childCursor++ : -1

    const res: EffectResolver = {
        sub: () => run(),
        unsubs: new DoubleLinkedList(),
        children: [],
        childCursor: 0,
        disposed: false,
        clearDependencies() {
            for (const unsub of res.unsubs) {
                unsub()
            }
            res.unsubs.clear()
        },
        dispose() {
            if (res.disposed) return
            res.disposed = true
            res.clearDependencies()
            scheduledExecutions.delete(res.sub)
            for (const child of res.children) {
                child.dispose()
            }
            res.children = []
            value = undefined
        },
    }

    if (parent) {
        const previous = parent.children[childIndex]
        if (previous && previous !== res) previous.dispose()
        parent.children[childIndex] = res
    }

    const run = () => {
        if (res.disposed) return
        if (isRunning) {
            pendingReRun = true
            return
        }

        isRunning = true
        res.clearDependencies()
        res.childCursor = 0
        pushCurrentResolver(res)

        try {
            value = sub(value)
        } catch (e) {
            console.error(e)
        } finally {
            popCurrentResolver()

            const staleChildren = res.children.splice(res.childCursor)
            for (const child of staleChildren) child.dispose()

            isRunning = false

            if (pendingReRun && !res.disposed) {
                pendingReRun = false
                scheduledExecutions.add(res.sub)
                scheduleExecution()
            }
        }
    }

    run()

    return () => res.dispose()
}
