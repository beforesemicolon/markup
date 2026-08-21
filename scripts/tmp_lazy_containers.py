from pathlib import Path

path = Path('src/html.ts')
source = path.read_text()
replacements = [
    ("    #partEffects = new Map<Runtime, EffectUnSubscriber>()\n", "    #partEffects?: Map<Runtime, EffectUnSubscriber>\n"),
    ("    __CHILDREN__: Set<HtmlTemplate> = new Set()\n", "    __CHILDREN__: Set<HtmlTemplate> | null = null\n"),
    ("        for (const child of this.__CHILDREN__) add(child.refs)\n", "        if (this.__CHILDREN__) {\n            for (const child of this.__CHILDREN__) add(child.refs)\n        }\n"),
    ("                template.__CHILDREN__.add(item)\n", "                ;(template.__CHILDREN__ ??= new Set()).add(item)\n"),
    ("        this.#partEffects.get(part)?.()\n        this.#partEffects.delete(part)\n", "        this.#partEffects?.get(part)?.()\n        this.#partEffects?.delete(part)\n"),
    ("            this.#partEffects.set(part, effect(commit))\n", "            ;(this.#partEffects ??= new Map()).set(part, effect(commit))\n"),
    ("        this.#partEffects.clear()\n", "        this.#partEffects?.clear()\n"),
    ("            template.__CHILDREN__.add(nextItem)\n", "            ;(template.__CHILDREN__ ??= new Set()).add(nextItem)\n"),
    ("            parentTemplate.__CHILDREN__.add(this)\n", "            ;(parentTemplate.__CHILDREN__ ??= new Set()).add(this)\n"),
    ("            this.__PARENT__?.__CHILDREN__.add(this)\n", "            if (this.__PARENT__) {\n                ;(this.__PARENT__.__CHILDREN__ ??= new Set()).add(this)\n            }\n"),
    ("        for (const child of this.__CHILDREN__) {\n            child.#dispose(false, false)\n        }\n        this.__CHILDREN__.clear()\n", "        if (this.__CHILDREN__) {\n            for (const child of this.__CHILDREN__) {\n                child.#dispose(false, false)\n            }\n            this.__CHILDREN__.clear()\n        }\n"),
    ("        if (detachFromParent) this.__PARENT__?.__CHILDREN__.delete(this)\n", "        if (detachFromParent) this.__PARENT__?.__CHILDREN__?.delete(this)\n"),
]

for old, new in replacements:
    if old not in source:
        raise SystemExit(f'missing replacement: {old!r}')
    source = source.replace(old, new)

path.write_text(source)
