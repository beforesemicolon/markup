from pathlib import Path
p=Path('src/html.ts')
s=p.read_text()
for old,new in [
("{ type: 'child'; node: number; value: number }", "{ type: 'child'; path: number[]; value: number }"),
("{ type: 'raw'; node: number; pieces: Piece[] }", "{ type: 'raw'; path: number[]; pieces: Piece[] }"),
("{ type: 'attr'; node: number; name: string; pieces: Piece[] }", "{ type: 'attr'; path: number[]; name: string; pieces: Piece[] }"),
("{ type: 'event'; node: number; name: string; value: number }", "{ type: 'event'; path: number[]; name: string; value: number }"),
("{ type: 'ref'; node: number; name?: string; value?: number }", "{ type: 'ref'; path: number[]; name?: string; value?: number }"),
("{ type: 'spread'; node: number; value: number; blocked: string[] }", "{ type: 'spread'; path: number[]; value: number; blocked: string[] }"),
]:
    if old not in s: raise SystemExit(f'missing type {old}')
    s=s.replace(old,new)
marker="function compile(parts: TemplateStringsArray | string[]): Definition {"
helper="""const getNodePath = (node: Node, root: Node) => {
    const path: number[] = []
    let current = node
    while (current !== root) {
        const parent = current.parentNode
        if (!parent) break
        path.push(Array.prototype.indexOf.call(parent.childNodes, current))
        current = parent
    }
    path.reverse()
    return path
}

"""
if helper not in s:
    if marker not in s: raise SystemExit('compile marker missing')
    s=s.replace(marker, helper+marker)
s=s.replace('node: nodeIndex,', 'path: getNodePath(node, template.content),')
old="""        const descriptors = this.#definition.parts
        const compiledNodes: Node[] = new Array(descriptors.length)

        if (descriptors.length) {
            const walker = document.createTreeWalker(
                fragment,
                NodeFilter.SHOW_ELEMENT |
                    NodeFilter.SHOW_COMMENT |
                    NodeFilter.SHOW_TEXT
            )
            let nodeIndex = -1
            let descriptorIndex = 0

            while (descriptorIndex < descriptors.length && walker.nextNode()) {
                nodeIndex++
                while (
                    descriptorIndex < descriptors.length &&
                    descriptors[descriptorIndex].node === nodeIndex
                ) {
                    compiledNodes[descriptorIndex++] = walker.currentNode
                }
            }
        }
"""
new="""        const descriptors = this.#definition.parts
        const compiledNodes = descriptors.map((descriptor) => {
            let node: Node = fragment
            for (const index of descriptor.path) node = node.childNodes[index]
            return node
        })
"""
if old not in s: raise SystemExit('mount walker block missing')
s=s.replace(old,new)
p.write_text(s)
