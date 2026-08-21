interface DLLElement<T> {
    value: T
    next: DLLElement<T> | null
    prev: DLLElement<T> | null
}

export class DoubleLinkedList<T> {
    #head: DLLElement<T> | null = null
    #tail: DLLElement<T> | null = null
    #map: Map<T, DLLElement<T>> | null = null;

    *[Symbol.iterator]() {
        let current = this.#head

        while (current) {
            yield current.value
            current = current.next
        }
    }

    static fromArray<T>(arr: Array<T>) {
        const list = new DoubleLinkedList<T>()

        for (const value of arr) {
            list.push(value)
        }

        return list
    }

    #ensureMap() {
        if (this.#map) return this.#map

        const map = new Map<T, DLLElement<T>>()
        let current = this.#head
        while (current) {
            map.set(current.value, current)
            current = current.next
        }
        this.#map = map
        return map
    }

    #getElement(value: T | null) {
        if (value === null) return null
        if (this.#map) return this.#map.get(value) ?? null
        return this.#head?.value === value ? this.#head : null
    }

    #compactMap() {
        if (this.#map?.size === 1) this.#map = null
    }

    get size() {
        return this.#map?.size ?? (this.#head ? 1 : 0)
    }

    get head(): T | null {
        return this.#head?.value ?? null
    }

    get tail(): T | null {
        return this.#tail?.value ?? null
    }

    push(value: T) {
        if (this.has(value)) return

        const element = { value, next: null, prev: null } as DLLElement<T>
        if (!this.#head) {
            this.#head = element
            this.#tail = element
            return
        }

        const map = this.#ensureMap()
        ;(this.#tail as DLLElement<T>).next = element
        element.prev = this.#tail
        this.#tail = element
        map.set(value, element)
    }

    pop() {
        const elementToRemove = this.#tail
        if (!elementToRemove) return

        if (elementToRemove.prev) {
            this.#tail = elementToRemove.prev
            this.#tail.next = null
            this.#map?.delete(elementToRemove.value)
            this.#compactMap()
        } else {
            this.#head = null
            this.#tail = null
            this.#map = null
        }
    }

    remove(value: T) {
        const element = this.#getElement(value)
        if (!element) return

        if (!this.#map) {
            this.#head = null
            this.#tail = null
            return
        }

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
        this.#compactMap()
    }

    insertValueAfter(newValue: T, value: T) {
        const element = this.#getElement(value)
        if (!element) return

        const existingElement = this.#getElement(newValue)
        if (existingElement && element.next === existingElement) return
        if (existingElement) this.remove(newValue)

        const map = this.#ensureMap()
        const newElement =
            existingElement ??
            ({ value: newValue, next: null, prev: null } as DLLElement<T>)

        newElement.prev = element
        newElement.next = element.next
        if (element === this.#tail) {
            this.#tail = newElement
        } else {
            ;(element.next as DLLElement<T>).prev = newElement
        }
        element.next = newElement
        map.set(newValue, newElement)
    }

    insertValueBefore(newValue: T, value: T) {
        const element = this.#getElement(value)
        if (!element) return

        const existingElement = this.#getElement(newValue)
        if (existingElement && element.prev === existingElement) return
        if (existingElement) this.remove(newValue)

        const map = this.#ensureMap()
        const newElement =
            existingElement ??
            ({ value: newValue, next: null, prev: null } as DLLElement<T>)

        newElement.next = element
        newElement.prev = element.prev
        if (element === this.#head) {
            this.#head = newElement
        } else {
            ;(element.prev as DLLElement<T>).next = newElement
        }
        element.prev = newElement
        map.set(newValue, newElement)
    }

    clear() {
        this.#head = null
        this.#tail = null
        this.#map = null
    }

    has(value: T) {
        return this.#map?.has(value) ?? this.#head?.value === value
    }

    getNextValueOf(value: T | null): T | null {
        return this.#getElement(value)?.next?.value ?? null
    }

    getPreviousValueOf(value: T | null): T | null {
        return this.#getElement(value)?.prev?.value ?? null
    }
}
