export class DynamicValueResolver<V = unknown, D = unknown> {
    data: D | null = null
    #renderedNodes: Node[] = []

    get renderedNodes() {
        return this.#renderedNodes
    }

    set renderedNodes(newNodes: Node[]) {
        this.#renderedNodes = Array.from(new Set(newNodes))
    }

    constructor(
        protected name: string,
        protected rawValue: string,
        public value: V,
        initialNodes: Node[],
        public prop: string | null = null
    ) {
        this.#renderedNodes = initialNodes
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resolve(refs?: Record<string, Set<Element>>) {}

    unmount() {}
}
