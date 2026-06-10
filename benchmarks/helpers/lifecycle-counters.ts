export interface LifecycleCounts {
    renders: number
    mounts: number
    moves: number
    updates: number
    unmounts: number
}

export class LifecycleTracker {
    counts: LifecycleCounts = {
        renders: 0,
        mounts: 0,
        moves: 0,
        updates: 0,
        unmounts: 0,
    }

    reset() {
        this.counts = {
            renders: 0,
            mounts: 0,
            moves: 0,
            updates: 0,
            unmounts: 0,
        }
    }

    wrapRenderer<T, R extends { onMount: any; onMove: any; onUpdate: any }>(
        renderFn: (item: T, index: number) => R
    ): (item: T, index: number) => R {
        return (item: T, index: number) => {
            this.counts.renders++
            const template = renderFn(item, index)
            if (template && typeof template.onMount === 'function') {
                template.onMount(() => {
                    this.counts.mounts++
                    return () => {
                        this.counts.unmounts++
                    }
                })
            }
            if (template && typeof template.onMove === 'function') {
                template.onMove(() => {
                    this.counts.moves++
                })
            }
            if (template && typeof template.onUpdate === 'function') {
                template.onUpdate(() => {
                    this.counts.updates++
                })
            }
            return template
        }
    }
}
