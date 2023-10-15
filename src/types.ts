export interface ExecutableValue {
    name: string
    rawValue: string
    value: unknown
    parts: unknown[]
    renderedNodes: Node[]
    prop?: string
}

export interface Executable {
    directives: ExecutableValue[]
    attributes: ExecutableValue[]
    content: ExecutableValue[]
    events: ExecutableValue[]
}

export type StateGetter<T> = () => T
export type StateSetter<T> = (newVal: T | ((val: T) => T)) => void
export type StateSubscriber = () => void
export type StateUnSubscriber = () => void
