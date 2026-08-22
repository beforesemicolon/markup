import { DoubleLinkedList } from './DoubleLinkedList.ts'
import {
    EffectSubscriber,
    EffectUnSubscriber,
    StateSubscriber,
} from './types.ts'

export interface ScheduledEffect {
    sub: StateSubscriber
    render: boolean
}

export interface EffectResolver extends ScheduledEffect {
    unsubs: DoubleLinkedList<EffectUnSubscriber>
    children: EffectResolver[]
    childCursor: number
    disposed: boolean
    clearDependencies: () => void
    dispose: () => void
}

const currentResolvers = new DoubleLinkedList<EffectResolver>()
const renderEffectSubscribers = new WeakSet<object>()

export const markRenderEffect = <T>(
    subscriber: EffectSubscriber<T>
): EffectSubscriber<T> => {
    renderEffectSubscribers.add(subscriber)
    return subscriber
}

export const isRenderEffect = <T>(subscriber: EffectSubscriber<T>): boolean =>
    renderEffectSubscribers.has(subscriber)

export const getCurrentResolver = (): EffectResolver | null =>
    currentResolvers.tail

export const pushCurrentResolver = (resolver: EffectResolver): void => {
    currentResolvers.push(resolver)
}

export const popCurrentResolver = (): void => {
    currentResolvers.pop()
}

export const untrack = <T>(callback: () => T): T => {
    const active: EffectResolver[] = []

    while (currentResolvers.tail) {
        active.push(currentResolvers.tail)
        currentResolvers.pop()
    }

    try {
        return callback()
    } finally {
        for (let index = active.length - 1; index >= 0; index--) {
            currentResolvers.push(active[index])
        }
    }
}
