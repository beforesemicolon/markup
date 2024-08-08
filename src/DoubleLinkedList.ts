interface DLLElement<T> {
    value: T
    next: DLLElement<T> | null
    prev: DLLElement<T> | null
}

export class DoubleLinkedList<T> {
    #head: DLLElement<T> | null = null
    #tail: DLLElement<T> | null = null
    #map = new Map();

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

    get size() {
        return this.#map.size
    }

    get head(): T | null {
        return this.#head?.value ?? null
    }

    get tail(): T | null {
        return this.#tail?.value ?? null
    }

    push(value: T) {
        if (!this.has(value)) {
            const element = { value, next: null, prev: null } as DLLElement<T>

            if (this.#map.size === 0) {
                this.#head = element
            } else {
                ;(this.#tail as DLLElement<T>).next = element
                element.prev = this.#tail
            }

            this.#tail = element

            this.#map.set(value, element)
        }
    }

    remove(value: T) {
        if (this.has(value)) {
            const element = this.#map.get(value)

            if (this.#map.size === 1) {
                this.#head = null
                this.#tail = null
            } else if (element === this.#head) {
                this.#head = element.next
                element.next.prev = null
            } else if (element === this.#tail) {
                this.#tail = element.prev
                element.prev.next = null
            } else {
                element.prev.next = element.next
                element.next.prev = element.prev
            }

            this.#map.delete(value)
        }
    }

    insertValueAfter(newValue: T, value: T) {
        if (this.has(value)) {
            const element = this.#map.get(value)
            const existingValue = this.#map.has(newValue)
            const newElement = this.#map.get(newValue) || {
                value: newValue,
                next: null,
                prev: null,
            }

            if (element.next !== newElement) {
                if (existingValue) {
                    this.remove(newValue)
                }

                newElement.prev = element
                newElement.next = element.next

                if (element === this.#tail) {
                    this.#tail = newElement
                } else {
                    element.next.prev = newElement
                }

                element.next = newElement

                this.#map.set(newValue, newElement)
            }
        }
    }

    insertValueBefore(newValue: T, value: T) {
        if (this.has(value)) {
            const element = this.#map.get(value)
            const existingValue = this.#map.has(newValue)
            const newElement = this.#map.get(newValue) || {
                value: newValue,
                next: null,
                prev: null,
            }

            if (element.prev !== newElement) {
                if (existingValue) {
                    this.remove(newValue)
                }

                newElement.next = element
                newElement.prev = element.prev

                if (element === this.#head) {
                    this.#head = newElement
                } else {
                    element.prev.next = newElement
                }

                element.prev = newElement

                this.#map.set(newValue, newElement)
            }
        }
    }

    clear() {
        this.#head = null
        this.#tail = null
        this.#map.clear()
    }

    has(value: T) {
        return this.#map.has(value)
    }

    getNextValueOf(value: T | null): T | null {
        return this.#map.get(value)?.next?.value ?? null
    }

    getPreviousValueOf(value: T | null): T | null {
        return this.#map.get(value)?.prev?.value ?? null
    }
}
