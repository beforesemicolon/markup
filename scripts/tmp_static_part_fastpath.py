from pathlib import Path
p=Path('src/html.ts')
s=p.read_text()
old="""        const nextSet = new Set(nextItems)

        if (!current.size) {
            const fragment = document.createDocumentFragment()
"""
new="""        if (!current.size) {
            const fragment = document.createDocumentFragment()
"""
if old not in s: raise SystemExit('initial reconcile block missing')
s=s.replace(old,new)
old2="""            return
        }

        let previous: Item | Node = anchor
"""
new2="""            return
        }

        const nextSet = new Set(nextItems)
        let previous: Item | Node = anchor
"""
# only replace first occurrence after reconcile; safe because exact spacing unique
idx=s.find(old2, s.find('const reconcileItems'))
if idx < 0: raise SystemExit('reconcile continuation missing')
s=s[:idx]+s[idx:].replace(old2,new2,1)
old3="""    #activatePart(part: Runtime) {
        this.#partEffects?.get(part)?.()
        this.#partEffects?.delete(part)

        let initialized = false
        let initialChanged = false
        const commit = () => {
            const changed = this.#commit(part, this.#values)
            if (!initialized) {
                initialChanged = changed
                initialized = true
            } else if (changed && this.#mounted) {
                this.#updateSub?.(this)
            }
        }

        if (this.#isReactive(part)) {
            ;(this.#partEffects ??= new Map()).set(part, effect(commit))
        } else {
            commit()
        }
        return initialChanged
    }
"""
new3="""    #activatePart(part: Runtime) {
        this.#partEffects?.get(part)?.()
        this.#partEffects?.delete(part)

        if (!this.#isReactive(part)) {
            return this.#commit(part, this.#values)
        }

        let initialized = false
        let initialChanged = false
        const commit = () => {
            const changed = this.#commit(part, this.#values)
            if (!initialized) {
                initialChanged = changed
                initialized = true
            } else if (changed && this.#mounted) {
                this.#updateSub?.(this)
            }
        }

        ;(this.#partEffects ??= new Map()).set(part, effect(commit))
        return initialChanged
    }
"""
if old3 not in s: raise SystemExit('activatePart block missing')
s=s.replace(old3,new3)
p.write_text(s)
