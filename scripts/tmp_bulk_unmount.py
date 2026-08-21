from pathlib import Path

html_path = Path('src/html.ts')
source = html_path.read_text()
old = """    unmount() {
        if (!this.#mounted) return this

        for (const unsub of this.#partEffects.values()) unsub()
        this.#partEffects.clear()

        for (const part of this.#runtime) {
            if (part.type === 'child') {
                this.#clearChild(part)
            } else if (part.type === 'event' && part.fn) {
                part.node.removeEventListener(
                    part.name.slice(2),
                    part.fn,
                    part.options
                )
            } else if (part.type === 'ref' && part.name) {
                this.__removeRef(part.name, part.node)
            } else if (part.type === 'spread') {
                for (const [key, value] of part.current) {
                    if (spreadName(key) === 'ref') {
                        this.__removeRef(String(value), part.node)
                    }
                }
                for (const [key, event] of part.events) {
                    part.node.removeEventListener(
                        spreadName(key).slice(2),
                        event.fn,
                        event.options
                    )
                }
            }
        }

        let node: Node | null = this.#markers[0]
        while (node) {
            const next: Node | null = node.nextSibling
            node.parentNode?.removeChild(node)
            if (node === this.#markers[1]) break
            node = next
        }

        this.__PARENT__?.__CHILDREN__.delete(this)
        this.__PARENT__ = null
        this.__CHILDREN__.clear()
        this.#runtime = []
        this.#refs = {}
        this.#mounted = false
        this.#unmountSub?.(this)
        return this
    }
"""
new = """    #dispose(removeDom: boolean, detachFromParent: boolean) {
        if (!this.#mounted) return

        for (const unsub of this.#partEffects.values()) unsub()
        this.#partEffects.clear()

        // Dispose nested templates without individually removing their DOM. The
        // root range is removed once below, avoiding O(n) descendant DOM teardown.
        for (const child of this.__CHILDREN__) {
            child.#dispose(false, false)
        }
        this.__CHILDREN__.clear()

        for (const part of this.#runtime) {
            if (part.type === 'child') part.items.clear()
        }

        if (removeDom && this.#markers[0].parentNode) {
            const range = document.createRange()
            range.setStartBefore(this.#markers[0])
            range.setEndAfter(this.#markers[1])
            range.deleteContents()
            range.detach()
        }

        if (detachFromParent) this.__PARENT__?.__CHILDREN__.delete(this)
        this.__PARENT__ = null
        this.#runtime = []
        this.#refs = {}
        this.#mounted = false
        this.#unmountSub?.(this)
    }

    unmount() {
        this.#dispose(true, true)
        return this
    }
"""
if old not in source:
    raise SystemExit('unmount block not found')
html_path.write_text(source.replace(old, new))

spec_path = Path('src/html.template-cache.spec.ts')
spec = spec_path.read_text()
marker = "describe('bulk nested teardown'"
if marker not in spec:
    spec += """

describe('bulk nested teardown', () => {
    it('runs nested cleanup and supports remount after parent unmount', () => {
        const cleanup = jest.fn()
        const child = html`<span>child</span>`.onMount(() => cleanup)
        const parent = html`<div>${child}</div>`

        parent.render(document.body)
        expect(document.body.innerHTML).toBe('<div><span>child</span></div>')

        parent.unmount()
        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(document.body.innerHTML).toBe('')
        expect(parent.mounted).toBe(false)
        expect(child.mounted).toBe(false)

        parent.render(document.body)
        expect(document.body.innerHTML).toBe('<div><span>child</span></div>')
        parent.unmount()
        expect(cleanup).toHaveBeenCalledTimes(2)
    })
})
"""
    spec_path.write_text(spec)
