import '../test.common.ts'
import { html } from './html.ts'
import { createRenderEffect, effect, state } from './state.ts'

describe('effect scheduler propagation', () => {
    it.each([
        ['total', 'left', 'right'],
        ['total', 'right', 'left'],
        ['left', 'total', 'right'],
        ['right', 'total', 'left'],
        ['left', 'right', 'total'],
        ['right', 'left', 'total'],
    ])('settles a diamond registered as %s, %s, %s', (...order) => {
        const [source, setSource] = state(0)
        const [left, setLeft] = state(0)
        const [right, setRight] = state(0)
        const [total, setTotal] = state(0)
        const callbacks: Record<string, () => void> = {
            left: () => {
                setLeft(source() * 2)
            },
            right: () => {
                setRight(source() * 3)
            },
            total: () => {
                setTotal(source() + left() + right())
            },
        }
        const dispose = order.map((name) => effect(callbacks[name]))

        setSource(1)
        jest.runAllTicks()

        expect([source(), left(), right(), total()]).toEqual([1, 2, 3, 6])

        setSource(2)
        jest.runAllTicks()

        expect([source(), left(), right(), total()]).toEqual([2, 4, 6, 12])
        dispose.forEach((stop) => stop())
    })

    it.each([
        ['last', 'middle', 'first'],
        ['first', 'middle', 'last'],
        ['middle', 'last', 'first'],
    ])('settles multiple hops registered as %s, %s, %s', (...order) => {
        const [source, setSource] = state(0)
        const [first, setFirst] = state(0)
        const [middle, setMiddle] = state(0)
        const [last, setLast] = state(0)
        const callbacks: Record<string, () => void> = {
            first: () => {
                setFirst(source() * 2)
            },
            middle: () => {
                setMiddle(source() + first())
            },
            last: () => {
                setLast(source() + middle())
            },
        }
        const dispose = order.map((name) => effect(callbacks[name]))

        setSource(2)
        jest.runAllTicks()

        expect([first(), middle(), last()]).toEqual([4, 6, 8])
        dispose.forEach((stop) => stop())
    })

    it('keeps synchronous writes batched before the flush', () => {
        const [first, setFirst] = state(0)
        const [second, setSecond] = state(0)
        const runs = jest.fn()
        const stop = effect(() => runs(first(), second()))
        runs.mockClear()

        setFirst(1)
        setSecond(1)
        setFirst(2)
        setSecond(3)
        jest.runAllTicks()

        expect(runs).toHaveBeenCalledTimes(1)
        expect(runs).toHaveBeenLastCalledWith(2, 3)
        stop()
    })

    it('allows a self-invalidating effect to converge', () => {
        const [count, setCount] = state(0)
        const runs = jest.fn()
        const stop = effect(() => {
            const value = count()
            runs(value)
            if (value > 0 && value < 5) setCount(value + 1)
        })
        runs.mockClear()

        setCount(1)
        jest.runAllTicks()

        expect(count()).toBe(5)
        expect(runs.mock.calls.map(([value]) => value)).toEqual([1, 2, 3, 4, 5])
        expect(jest.getTimerCount()).toBe(0)
        stop()
    })

    it('runs cleanup before every valid rerun and on disposal', () => {
        const [source, setSource] = state(0)
        const [derived, setDerived] = state(0)
        const lifecycle: string[] = []
        const stopConsumer = effect(() => {
            const value = source() + derived()
            lifecycle.push(`run:${value}`)
            return () => {
                lifecycle.push(`cleanup:${value}`)
            }
        })
        const stopProducer = effect(() => {
            setDerived(source() * 2)
        })

        setSource(1)
        jest.runAllTicks()
        stopConsumer()
        stopProducer()

        expect(lifecycle).toEqual([
            'run:0',
            'cleanup:0',
            'run:1',
            'cleanup:1',
            'run:3',
            'cleanup:3',
        ])
    })

    it('cancels a queued rerun when a later effect disposes the consumer', () => {
        const [source, setSource] = state(0)
        const [derived, setDerived] = state(0)
        const consumer = jest.fn()
        const cleanup = jest.fn()
        const stopConsumer = effect(() => {
            consumer(source(), derived())
            return cleanup
        })
        const stopProducer = effect(() => {
            const value = source()
            setDerived(value * 2)
            if (value > 0) stopConsumer()
        })
        consumer.mockClear()

        setSource(1)
        jest.runAllTicks()

        expect(consumer).toHaveBeenCalledTimes(1)
        expect(consumer).toHaveBeenLastCalledWith(1, 0)
        expect(cleanup).toHaveBeenCalledTimes(2)
        expect(jest.getTimerCount()).toBe(0)
        stopProducer()
    })

    it('commits the DOM before each user rerun triggered by a later producer', () => {
        const [source, setSource] = state(0)
        const [derived, setDerived] = state(0)
        const snapshots: Array<[number, number, string | null]> = []
        const stopConsumer = effect(() => {
            snapshots.push([source(), derived(), document.body.textContent])
        })
        const stopProducer = effect(() => {
            setDerived(source() * 2)
        })
        const view = html`<p>${source}/${derived}</p>`.render(document.body)
        snapshots.length = 0

        setSource(1)
        jest.runAllTicks()

        expect(snapshots).toEqual([
            [1, 0, '1/0'],
            [1, 2, '1/2'],
        ])
        expect(document.body.textContent).toBe('1/2')
        stopConsumer()
        stopProducer()
        view.unmount()
    })

    it('applies the execution limit per subscriber rather than to a large graph', () => {
        const [source, setSource] = state(0)
        const outputs = Array.from({ length: 150 }, () => state(0))
        const dispose = outputs.map(([, setOutput]) =>
            effect(() => {
                setOutput(source())
            })
        )

        setSource(1)
        jest.runAllTicks()

        expect(outputs.every(([getOutput]) => getOutput() === 1)).toBe(true)
        dispose.forEach((stop) => stop())
    })

    it('commits a shared aggregate before every independent producer', () => {
        const reportError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const [source, setSource] = state(0)
        const [total, setTotal] = state(0)
        const snapshots: Array<string | null> = []
        const dispose = Array.from({ length: 150 }, () =>
            effect(() => {
                if (source()) {
                    snapshots.push(document.body.textContent)
                    setTotal((value) => value + 1)
                }
            })
        )
        const view = html`<p>${total}</p>`.render(document.body)

        try {
            setSource(1)
            jest.runAllTicks()

            expect(total()).toBe(150)
            expect(document.body.textContent).toBe('150')
            expect(snapshots).toEqual(
                Array.from({ length: 150 }, (_, index) => String(index))
            )
            expect(reportError).not.toHaveBeenCalled()

            snapshots.length = 0
            setSource(2)
            jest.runAllTicks()

            expect(total()).toBe(300)
            expect(document.body.textContent).toBe('300')
            expect(snapshots).toEqual(
                Array.from({ length: 150 }, (_, index) => String(index + 150))
            )
            expect(reportError).not.toHaveBeenCalled()
            expect(jest.getTimerCount()).toBe(0)
        } finally {
            dispose.forEach((stop) => stop())
            view.unmount()
            reportError.mockRestore()
        }
    })
})

describe('effect scheduler cycle guard', () => {
    it('bounds a downstream cycle and preserves unrelated queued work', () => {
        const reportError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const [source, setSource] = state(0)
        const [derived, setDerived] = state(0)
        const [unrelated, setUnrelated] = state(0)
        const upstream = jest.fn()
        const downstream = jest.fn()
        const observer = jest.fn()
        const stopUpstream = effect(() => {
            const value = source()
            upstream(value)
            if (value > 0) setDerived(value)
        })
        const stopDownstream = effect(() => {
            const value = derived()
            downstream(value)
            if (value > 0) setSource(value + 1)
            // Queue unrelated work behind the subscriber that reaches its cap.
            if (value === 100) setUnrelated(1)
        })
        const stopObserver = effect(() => observer(unrelated()))
        upstream.mockClear()
        downstream.mockClear()
        observer.mockClear()

        try {
            setSource(1)
            jest.runAllTicks()

            expect(upstream).toHaveBeenCalledTimes(100)
            expect(downstream).toHaveBeenCalledTimes(100)
            expect(observer).toHaveBeenCalledTimes(1)
            expect(observer).toHaveBeenLastCalledWith(1)
            expect(reportError).toHaveBeenCalledTimes(1)
            expect(reportError.mock.calls[0][0]).toBeInstanceOf(Error)
            expect((reportError.mock.calls[0][0] as Error).message).toContain(
                'Maximum reactive updates exceeded'
            )
            expect(jest.getTimerCount()).toBe(0)

            // Hitting the guard does not permanently disable a subscriber.
            stopDownstream()
            upstream.mockClear()
            setSource(200)
            jest.runAllTicks()
            expect(upstream).toHaveBeenCalledTimes(1)
            expect(derived()).toBe(200)
            expect(reportError).toHaveBeenCalledTimes(1)
        } finally {
            stopUpstream()
            stopDownstream()
            stopObserver()
            reportError.mockRestore()
        }
    })

    it('bounds a render cycle without starving user effects', () => {
        const reportError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const [source, setSource] = state(0)
        const [unrelated, setUnrelated] = state(0)
        const render = jest.fn()
        const observer = jest.fn()
        const stopRender = createRenderEffect(() => {
            const value = source()
            render(value)
            if (value > 0) setSource(value + 1)
        })
        const stopObserver = effect(() => observer(unrelated()))
        render.mockClear()
        observer.mockClear()

        try {
            setSource(1)
            setUnrelated(1)
            jest.runAllTicks()

            expect(render).toHaveBeenCalledTimes(100)
            expect(observer).toHaveBeenCalledTimes(1)
            expect(observer).toHaveBeenLastCalledWith(1)
            expect(reportError).toHaveBeenCalledTimes(1)
            expect(jest.getTimerCount()).toBe(0)
        } finally {
            stopRender()
            stopObserver()
            reportError.mockRestore()
        }
    })

    it('bounds cycles alternating render work and user effects', () => {
        const reportError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const [source, setSource] = state(0)
        const [derived, setDerived] = state(0)
        const render = jest.fn()
        const user = jest.fn()
        const stopRender = createRenderEffect(() => {
            const value = source()
            render(value)
            setDerived(value)
        })
        const stopUser = effect(() => {
            const value = derived()
            user(value)
            if (value > 0) setSource(value + 1)
        })
        const view = html`<p>${derived}</p>`.render(document.body)
        render.mockClear()
        user.mockClear()

        try {
            setSource(1)
            jest.runAllTicks()

            expect(user).toHaveBeenCalledTimes(100)
            expect(render).toHaveBeenCalledTimes(101)
            expect(source()).toBe(101)
            expect(derived()).toBe(101)
            expect(document.body.textContent).toBe('101')
            expect(reportError).toHaveBeenCalledTimes(1)
            expect(jest.getTimerCount()).toBe(0)
        } finally {
            stopRender()
            stopUser()
            view.unmount()
            reportError.mockRestore()
        }
    })

    it('bounds each render pass and reports a recurring cycle once per flush', () => {
        const reportError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const [source, setSource] = state(0)
        const [unrelated, setUnrelated] = state(0)
        const render = jest.fn()
        const observer = jest.fn()
        const stopRender = createRenderEffect(() => {
            const value = source()
            render(value)
            if (value > 0) setSource(value + 1)
        })
        const stopObserver = effect(() => {
            const value = unrelated()
            observer(value)
            if (value > 0) setSource(1000)
        })
        render.mockClear()
        observer.mockClear()

        try {
            setSource(1)
            setUnrelated(1)
            jest.runAllTicks()

            expect(render).toHaveBeenCalledTimes(200)
            expect(render).toHaveBeenNthCalledWith(101, 1000)
            expect(observer).toHaveBeenCalledTimes(1)
            expect(reportError).toHaveBeenCalledTimes(1)
            expect(jest.getTimerCount()).toBe(0)
        } finally {
            stopRender()
            stopObserver()
            reportError.mockRestore()
        }
    })
})
