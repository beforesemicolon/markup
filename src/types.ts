export enum DynamicValueType {
    Content = 'content',
    Attribute = 'attribute',
    Directive = 'directive',
    Event = 'event',
}

export type ObjectLiteral = Record<string | symbol | number, unknown>

export interface DynamicValue<T = unknown, D = unknown> {
    name: string // name of the node property or attribute to target when updating
    type: DynamicValueType
    rawValue: string // raw value collected from the template
    value: T // value injected in the template
    data: D // last result on the dynamic value
    renderedNodes: Node[] // nodes currently rendered
    prop: string | null // attribute suffix, e.g in class.active, active is the suffix
}

export type StateGetter<T> = () => T
export type StateSetter<T> = (newVal: T | ((val: T) => T)) => void
export type StateSubscriber = () => void
export type StateUnSubscriber = () => void

export type AnythingButAFunction<T> = T extends typeof Function
    ? never
    : unknown
export type HelperValueChecker<T> = (val: T) => boolean
