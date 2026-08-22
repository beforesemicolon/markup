import { DoubleLinkedList } from './DoubleLinkedList.ts'
import { EffectUnSubscriber, StateSubscriber } from './types.ts'

export interface EffectResolver {
    sub: StateSubscriber
    unsubs: DoubleLinkedList<EffectUnSubscriber>
    children: EffectResolver[]
    childCursor: number
    disposed: boolean
    clearDependencies: () => void
    dispose: () => void
}

const currentResolvers = new DoubleLinkedList<EffectResolver>()

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
