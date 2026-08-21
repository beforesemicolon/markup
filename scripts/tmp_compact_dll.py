from pathlib import Path
p=Path('src/DoubleLinkedList.ts')
s=p.read_text()
s=s.replace('    #map = new Map();\n', '    #map: Map<T, DLLElement<T>> | null = null\n')
s=s.replace('        return this.#map.size\n', '        return this.#map?.size ?? (this.#head ? 1 : 0)\n')
s=s.replace("    push(value: T) {\n        if (!this.has(value)) {\n            const element = { value, next: null, prev: null } as DLLElement<T>\n\n            if (this.#map.size === 0) {\n                this.#head = element\n            } else {\n                ;(this.#tail as DLLElement<T>).next = element\n                element.prev = this.#tail\n            }\n\n            this.#tail = element\n\n            this.#map.set(value, element)\n        }\n    }", """    push(value: T) {
        if (this.has(value)) return

        const element = { value, next: null, prev: null } as DLLElement<T>
        if (!this.#head) {
            this.#head = element
            this.#tail = element
            return
        }

        if (!this.#map) {
            this.#map = new Map([[this.#head.value, this.#head]])
        }
        ;(this.#tail as DLLElement<T>).next = element
        element.prev = this.#tail
        this.#tail = element
        this.#map.set(value, element)
    }""")
s=s.replace('        this.#map.delete(valueToPop)\n', """        this.#map?.delete(valueToPop)
        if (this.#map?.size === 1 && this.#head) this.#map = null
""")
start=s.index('    remove(value: T) {')
end=s.index('\n    insertValueAfter', start)
s=s[:start]+"""    remove(value: T) {
        if (!this.has(value)) return

        if (!this.#map) {
            this.#head = null
            this.#tail = null
            return
        }

        const element = this.#map.get(value) as DLLElement<T>
        if (element === this.#head) {
            this.#head = element.next
            if (this.#head) this.#head.prev = null
        } else if (element === this.#tail) {
            this.#tail = element.prev
            if (this.#tail) this.#tail.next = null
        } else {
            ;(element.prev as DLLElement<T>).next = element.next
            ;(element.next as DLLElement<T>).prev = element.prev
        }
        this.#map.delete(value)
        if (this.#map.size === 1) this.#map = null
    }
"""+s[end:]
s=s.replace('            const element = this.#map.get(value)\n            const existingValue = this.#map.has(newValue)\n            const newElement = this.#map.get(newValue) || {', '            const element = this.#map?.get(value) ?? this.#head\n            const existingValue = this.has(newValue)\n            const newElement = this.#map?.get(newValue) || {')
s=s.replace('                this.#map.set(newValue, newElement)\n', '                if (!this.#map && this.#head) this.#map = new Map([[this.#head.value, this.#head]])\n                this.#map.set(newValue, newElement)\n')
s=s.replace('        this.#map.clear()\n', '        this.#map = null\n')
s=s.replace('        return this.#map.has(value)\n', '        return this.#map?.has(value) ?? this.#head?.value === value\n')
s=s.replace('        return this.#map.get(value)?.next?.value ?? null\n', '        if (!value) return null\n        return (this.#map?.get(value) ?? (this.#head?.value === value ? this.#head : null))?.next?.value ?? null\n')
s=s.replace('        return this.#map.get(value)?.prev?.value ?? null\n', '        if (!value) return null\n        return (this.#map?.get(value) ?? (this.#head?.value === value ? this.#head : null))?.prev?.value ?? null\n')
p.write_text(s)
