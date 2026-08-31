import { StateSubscriber } from './types.ts'

export interface ScheduledEffect {
    sub: StateSubscriber
    render: boolean
}

export interface EffectDependency {
    unsubscribe: (resolver: EffectResolver) => void
}

export interface EffectResolver extends ScheduledEffect {
    primaryDependency?: EffectDependency
    primaryDependencyEpoch: number
    additionalDependencies?: Map<EffectDependency, number>
    dependencyEpoch: number
    children?: EffectResolver[]
    childCursor: number
    disposed: boolean
    trackDependency: (dependency: EffectDependency) => void
    pruneDependencies: () => void
    clearDependencies: () => void
    dispose: () => void
}

let currentResolver: EffectResolver | null = null
const trackingFloors: Array<EffectResolver | null> = []

export const getCurrentResolver = (): EffectResolver | null => {
    if (!trackingFloors.length) return currentResolver
    return currentResolver === trackingFloors[trackingFloors.length - 1]
        ? null
        : currentResolver
}

export const pushCurrentResolver = (
    resolver: EffectResolver
): EffectResolver | null => {
    const previous = currentResolver
    currentResolver = resolver
    return previous
}

export const popCurrentResolver = (previous: EffectResolver | null): void => {
    currentResolver = previous
}

export const untrack = <T>(callback: () => T): T => {
    trackingFloors.push(currentResolver)

    try {
        return callback()
    } finally {
        trackingFloors.pop()
    }
}
