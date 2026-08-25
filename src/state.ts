import {
    EffectSubscriber,
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
} from './types.ts'
import {
    EffectDependency,
    EffectResolver,
    getCurrentResolver,
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
    if (!hasScheduledExecutions()) return
    scheduledRenderExecutions.delete(subscriber)
    scheduledUserExecutions.delete(subscriber)
}

const takeFirstSubscriber = (
    subscribers: Set<SchedulerSubscriber>
): SchedulerSubscriber | undefined => {
    const first = subscribers.values().next()
    if (first.done) return
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
        for (const renderSubscriber of scheduledRenderExecutions) {
            scheduledRenderExecutions.delete(renderSubscriber)
            if (renderEpochs.get(renderSubscriber) === renderEpoch) continue

            renderEpochs.set(renderSubscriber, renderEpoch)
            runSubscriber(renderSubscriber)
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
    const subs = new Set<SchedulerSubscriber>()

    if (sub) subs.add(sub)

    const removeSub = (
        subscriber?: SchedulerSubscriber,
        cancelScheduled = false
    ): void => {
        if (!subscriber) return
        subs.delete(subscriber)
        if (cancelScheduled) removeScheduledSubscriber(subscriber)
    }

    const dependency: EffectDependency = {
        unsubscribe: (resolver) => removeSub(resolver),
    }

    return Object.freeze([
        () => {
            const currentResolver = getCurrentResolver()
            if (currentResolver) {
                subs.add(currentResolver)
                currentResolver.trackDependency(dependency)
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

class RuntimeEffect<T> implements EffectResolver {
    primaryDependency?: EffectDependency
    primaryDependencyEpoch = 0
    additionalDependencies?: Map<EffectDependency, number>
    dependencyEpoch = 0
    children?: EffectResolver[]
    childCursor = 0
    disposed = false

    #value?: T
    #running = false
    #pendingReRun = false
    readonly #callback: EffectSubscriber<T>
    readonly render: boolean

    constructor(callback: EffectSubscriber<T>, render: boolean) {
        this.#callback = callback
        this.render = render
    }

    sub(): void {
        if (this.disposed) return
        if (this.#running) {
            this.#pendingReRun = true
            return
        }

        this.#running = true
        this.dependencyEpoch++
        this.childCursor = 0
        const previousResolver = pushCurrentResolver(this)

        try {
            this.#value = this.#callback(this.#value)
        } catch (error) {
            console.error(error)
        } finally {
            popCurrentResolver(previousResolver)
            this.pruneDependencies()

            if (this.children && this.childCursor < this.children.length) {
                for (
                    let index = this.childCursor;
                    index < this.children.length;
                    index++
                ) {
                    this.children[index].dispose()
                }
                this.children.length = this.childCursor
            }

            this.#running = false

            if (this.#pendingReRun && !this.disposed) {
                this.#pendingReRun = false
                scheduleSubscriber(this)
                scheduleExecution()
            }
        }
    }

    trackDependency(dependency: EffectDependency): void {
        if (this.primaryDependency === dependency) {
            this.primaryDependencyEpoch = this.dependencyEpoch
            return
        }

        if (this.additionalDependencies?.has(dependency)) {
            this.additionalDependencies.set(dependency, this.dependencyEpoch)
            return
        }

        if (!this.primaryDependency) {
            this.primaryDependency = dependency
            this.primaryDependencyEpoch = this.dependencyEpoch
            return
        }

        ;(this.additionalDependencies ??= new Map()).set(
            dependency,
            this.dependencyEpoch
        )
    }

    pruneDependencies(): void {
        if (
            this.primaryDependency &&
            this.primaryDependencyEpoch !== this.dependencyEpoch
        ) {
            this.primaryDependency.unsubscribe(this)
            this.primaryDependency = undefined
        }

        if (this.additionalDependencies) {
            for (const [dependency, epoch] of this.additionalDependencies) {
                if (epoch === this.dependencyEpoch) continue
                dependency.unsubscribe(this)
                this.additionalDependencies.delete(dependency)
            }

            if (!this.additionalDependencies.size) {
                this.additionalDependencies = undefined
            }
        }
    }

    clearDependencies(): void {
        this.primaryDependency?.unsubscribe(this)
        this.primaryDependency = undefined

        if (this.additionalDependencies) {
            for (const dependency of this.additionalDependencies.keys()) {
                dependency.unsubscribe(this)
            }
            this.additionalDependencies.clear()
            this.additionalDependencies = undefined
        }
    }

    dispose(): void {
        if (this.disposed) return
        this.disposed = true
        this.clearDependencies()
        removeScheduledSubscriber(this)
        if (this.children) {
            for (const child of this.children) child.dispose()
            this.children = undefined
        }
        this.#value = undefined
    }
}

const createEffect = <T>(sub: EffectSubscriber<T>, renderEffect: boolean) => {
    if (typeof sub !== 'function') {
        throw new Error(`effect: callback must be a function`)
    }

    const parent = getCurrentResolver()
    const childIndex = parent ? parent.childCursor++ : -1
    const resolver = new RuntimeEffect(sub, renderEffect)

    if (parent) {
        const children = (parent.children ??= [])
        const previous = children[childIndex]
        if (previous && previous !== resolver) previous.dispose()
        children[childIndex] = resolver
    }

    resolver.sub()
    return () => resolver.dispose()
}

export const effect = <T>(sub: EffectSubscriber<T>) => createEffect(sub, false)

export const createRenderEffect = <T>(sub: EffectSubscriber<T>) =>
    createEffect(sub, true)
