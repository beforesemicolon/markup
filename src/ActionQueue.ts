type Action = () => void

export class ActionQueue {
    #queue: Set<Action> = new Set()
    #time = Date.now()
    #timeout: NodeJS.Timeout | undefined

    set(action: Action) {
        this.#queue.add(action)
        this.#run()
    }

    #run() {
        const actions = Array.from(this.#queue)
        const timeElapsed = Date.now() - this.#time

        clearTimeout(this.#timeout)

        if (timeElapsed >= 25) {
            this.#queue.clear()
            this.#time = Date.now()
            this.#executeActions(actions)
        } else {
            this.#timeout = this.#executeActions(actions)
        }
    }

    #executeActions(actions: Action[]) {
        return setTimeout(() => {
            actions.forEach((cb) => cb())
        })
    }
}
