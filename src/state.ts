import {
    EffectCleanup,
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
    untrack,
} from './effect-context.ts'

type SchedulerSubscriber = StateSubscriber | EffectResolver

const scheduledRenderExecutions = new Set<SchedulerSubscriber>()
const scheduledUserExecutions = new Set<SchedulerSubscriber>()
const stateGetters = new WeakSet<object>()
const MAX_SUBSCRIBER_EXECUTIONS = 100

let flushPending = false

/** @internal */
export const isStateGetter = (value: object): boolean => stateGetters.has(value)

const hasScheduledExecutions = (): boolean =>
    scheduledRenderExecutions.size > 0 || scheduledUserExecutions.size > 0

const isScheduledEffect = (
    subscriber: SchedulerSubscriber
): subscriber is EffectResolver => typeof subscriber !== 'function'

const isEffectCleanup = <T>(
    value: T | EffectCleanup | undefined
): value is EffectCleanup => typeof value === 'function'

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
    const userExecutionCounts = new Map<SchedulerSubscriber, number>()
    const renderExecutionCounts = new Map<SchedulerSubscriber, number>()
    let reportedSubscribers: Set<SchedulerSubscriber> | undefined
    const execute = (
        subscriber: SchedulerSubscriber,
        executionCounts: Map<SchedulerSubscriber, number>
    ): boolean => {
        if (isScheduledEffect(subscriber) && subscriber.disposed) return false
        const count = executionCounts.get(subscriber) ?? 0
        if (count >= MAX_SUBSCRIBER_EXECUTIONS) {
            if (!reportedSubscribers?.has(subscriber)) {
                reportedSubscribers ??= new Set()
                reportedSubscribers.add(subscriber)
                const scope =
                    executionCounts === renderExecutionCounts
                        ? 'render pass'
                        : 'flush'
                console.error(
                    new Error(
                        `Maximum reactive updates exceeded (${MAX_SUBSCRIBER_EXECUTIONS} executions in one ${scope}). Check effects for a state update cycle.`
                    )
                )
            }
            return false
        }

        executionCounts.set(subscriber, count + 1)
        runSubscriber(subscriber)
        return true
    }

    // A later subscriber may invalidate one that already ran. Drain those
    // updates too, while bounding cycles per subscriber rather than dropping
    // valid propagation or cancelling unrelated work.
    while (hasScheduledExecutions()) {
        for (const renderSubscriber of scheduledRenderExecutions) {
            scheduledRenderExecutions.delete(renderSubscriber)
            execute(renderSubscriber, renderExecutionCounts)
        }

        // Keep the DOM current before every user effect, including reruns.
        const userSubscriber = takeFirstSubscriber(scheduledUserExecutions)
        if (!userSubscriber) break
        if (execute(userSubscriber, userExecutionCounts)) {
            // Independent producers may each update the same displayed value.
            // Bound render-only cycles within a pass, not these valid commits
            // across user effects. User cycles remain bounded for the flush.
            renderExecutionCounts.clear()
        }
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

    const getter: StateGetter<T> = () => {
        const currentResolver = getCurrentResolver()
        if (currentResolver) {
            subs.add(currentResolver)
            currentResolver.trackDependency(dependency)
        }
        return value
    }
    stateGetters.add(getter)

    return Object.freeze([
        getter,
        (newVal: T | ((val: T) => T)) => {
            const updatedValue =
                typeof newVal === 'function'
                    ? (newVal as (val: T) => T)(value)
                    : newVal

            if (!Object.is(updatedValue, value)) {
                value = updatedValue
                const currentResolver = getCurrentResolver()
                for (const subscriber of subs) {
                    if (subscriber === currentResolver) {
                        const readEpoch =
                            currentResolver.primaryDependency === dependency
                                ? currentResolver.primaryDependencyEpoch
                                : currentResolver.additionalDependencies?.get(
                                      dependency
                                  )
                        // A write before this execution's first read cannot
                        // invalidate that read; it will see the updated value.
                        if (readEpoch !== currentResolver.dependencyEpoch) {
                            continue
                        }
                    }
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
    #cleanup?: EffectCleanup
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
        this.#runCleanup()
        this.dependencyEpoch++
        this.childCursor = 0
        const previousResolver = pushCurrentResolver(this)

        try {
            const result = this.#callback(this.#value)
            if (isEffectCleanup(result)) {
                this.#cleanup = result
                this.#value = undefined
            } else {
                this.#value = result
            }
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

    #runCleanup(): void {
        if (!this.#cleanup) return

        const cleanup = this.#cleanup
        this.#cleanup = undefined
        try {
            untrack(cleanup)
        } catch (error) {
            console.error(error)
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
        this.#runCleanup()
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
