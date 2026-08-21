from pathlib import Path

path = Path('src/html.ts')
source = path.read_text()
old = """        if (removeDom && this.#markers[0].parentNode) {
            const range = document.createRange()
            range.setStartBefore(this.#markers[0])
            range.setEndAfter(this.#markers[1])
            range.deleteContents()
            range.detach()
        }
"""
new = """        if (removeDom) {
            let node: Node | null = this.#markers[0]
            while (node) {
                const next: Node | null = node.nextSibling
                node.parentNode?.removeChild(node)
                if (node === this.#markers[1]) break
                node = next
            }
        }
"""
if old not in source:
    raise SystemExit('range removal block not found')
path.write_text(source.replace(old, new))
