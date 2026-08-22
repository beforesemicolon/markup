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
    isRenderEffect,
    popCurrentResolver,
    pushCurrentResolver,
    ScheduledEffect,
} from './effect-context.ts'

type SchedulerSubscriber = StateSubscriber | ScheduledEffect

const scheduledRenderExecutions = new Set<SchedulerSubscriber>()
const scheduledUserExecutions = new Set<SchedulerSubscriber>()

let flushPending = false

const hasScheduledExecutions = (): boolean =>
    scheduledRenderExecutions.size > 0 || scheduledUserExecutions.size > 0

const isScheduledEffect = (
    subscriber: SchedulerSubscriber
): subscriber is ScheduledEffect => typeof subscriber !== 'function'

const scheduleSubscriber = (subscriber: SchedulerSubscriber): void => {
    const queue =
        isScheduledEffect(subscriber) && subscriber.render
            ? scheduledRenderExecutions
            : scheduledUserExecutions
    queue.add(subscriber)
}

const removeScheduledSubscriber = (subscriber: SchedulerSubscriber): void => {
    scheduledRenderExecutions.delete(subscriber)
    scheduledUserExecutions.delete(subscriber)
}

const takeFirstSubscriber = (
    subscribers: Set<SchedulerSubscriber>
): SchedulerSubscriber | undefined => {
    const first = subscribers.values().next()
    if (first.done) return undefined
    subscribers.delete(first.value)
    return first.value
}

const runSubscriber = (subscriber: SchedulerSubscriber): void => {
    if (isScheduledEffect(subscriber)) subscriber.sub()
    else subscriber()
}

const flushScheduledExecutions = (): void => {
    const visitedUserSubscribers = new Set<SchedulerSubscriber>()
    const renderEpochs = new Map<SchedulerSubscriber, number>()
    let renderEpoch = 0

    // Keep the DOM current before each user effect while allowing a render
    // invalidated by that effect to run once more without spinning in a cycle.
    while (hasScheduledExecutions()) {
        const renderSubscriber = takeFirstSubscriber(scheduledRenderExecutions)

        if (renderSubscriber) {
            if (renderEpochs.get(renderSubscriber) === renderEpoch) continue

            renderEpochs.set(renderSubscriber, renderEpoch)
            runSubscriber(renderSubscriber)
            continue
        }

        const userSubscriber = takeFirstSubscriber(scheduledUserExecutions)
        if (!userSubscriber) break
        if (visitedUserSubscribers.has(userSubscriber)) continue

        visitedUserSubscribers.add(userSubscriber)
        runSubscriber(userSubscriber)
        renderEpoch++
    }
}

const scheduleExecution = (): void => {
    if (flushPending) return
    flushPending = true
    queueMicrotask(() => {
        try {
            flushScheduledExecutions()
        } finally {
            flushPending = false
            if (hasScheduledExecutions()) scheduleExecution()
        }
    })
}

export const state = <T>(
    value: T,
    sub?: StateSubscriber
): Readonly<[StateGetter<T>, StateSetter<T>, StateUnSubscriber]> => {
    const subs: DoubleLinkedList<SchedulerSubscriber> = new DoubleLinkedList()

    if (sub) subs.push(sub)

    const removeSub = (
        subscriber?: SchedulerSubscriber,
        cancelScheduled = false
    ): void => {
        if (!subscriber) return
        subs.remove(subscriber)
        if (cancelScheduled) removeScheduledSubscriber(subscriber)
    }

    return Object.freeze([
        () => {
            const currentResolver = getCurrentResolver()
            if (currentResolver && !subs.has(currentResolver)) {
                subs.push(currentResolver)
                currentResolver.unsubs.push(() => removeSub(currentResolver))
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
                    scheduleSubscriber(subscriber)
                }
                if (hasScheduledExecutions()) scheduleExecution()
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
    const renderEffect = isRenderEffect(sub)

    const parent = getCurrentResolver()
    const childIndex = parent ? parent.childCursor++ : -1

    const res: EffectResolver = {
        sub: () => run(),
        render: renderEffect,
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
            removeScheduledSubscriber(res)
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
                scheduleSubscriber(res)
                scheduleExecution()
            }
        }
    }

    run()

    return () => res.dispose()
}
