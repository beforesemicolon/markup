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
