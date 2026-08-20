import '../test.common.ts'
import { html } from './html.ts'
import { effect, state } from './state.ts'

describe('effect scheduler regressions', () => {
    it('keeps retained template effects alive across parent reruns', () => {
        const [parentTick, setParentTick] = state(0)
        const [disabled, setDisabled] = state(false)
        const child = html`<button disabled="${() => disabled()}">save</button>`
        const view = html`${() => {
            parentTick()
            return child
        }}`.render(document.body)

        const button = document.body.querySelector('button') as HTMLButtonElement
        expect(button.disabled).toBe(false)

        setParentTick(1)
        jest.advanceTimersToNextTimer()
        expect(document.body.querySelector('button')).toBe(button)

        setDisabled(true)
        jest.advanceTimersToNextTimer()

        expect(button.disabled).toBe(true)
        expect(button.getAttribute('disabled')).toBe('true')
        view.unmount()
    })

    it('does not run an explicitly disposed effect that is already queued', () => {
        const [count, setCount] = state(0)
        const spy = jest.fn()
        const dispose = effect(() => spy(count()))

        spy.mockClear()
        setCount(1)
        dispose()
        jest.advanceTimersToNextTimer()

        expect(spy).not.toHaveBeenCalled()
    })

    it('drains downstream state updates in the same flush', () => {
        const [source, setSource] = state(0)
        const [derived, setDerived] = state(0)
        const downstream = jest.fn()

        effect(() => {
            setDerived(source() * 2)
        })
        effect(() => {
            downstream(derived())
        })

        downstream.mockClear()
        setSource(2)
        jest.advanceTimersToNextTimer()

        expect(downstream).toHaveBeenCalledTimes(1)
        expect(downstream).toHaveBeenLastCalledWith(4)
    })

    it('executes each subscriber at most once when a downstream effect creates a cycle', () => {
        const [source, setSource] = state(0)
        const [derived, setDerived] = state(0)
        const upstream = jest.fn()
        const downstream = jest.fn()

        effect(() => {
            const value = source()
            upstream(value)
            if (value > 0) setDerived(value)
        })

        effect(() => {
            const value = derived()
            downstream(value)
            if (value > 0) setSource(value + 1)
        })

        upstream.mockClear()
        downstream.mockClear()

        setSource(1)
        jest.advanceTimersToNextTimer()

        expect(upstream).toHaveBeenCalledTimes(1)
        expect(upstream).toHaveBeenLastCalledWith(1)
        expect(downstream).toHaveBeenCalledTimes(1)
        expect(downstream).toHaveBeenLastCalledWith(1)

        jest.runOnlyPendingTimers()

        expect(upstream).toHaveBeenCalledTimes(1)
        expect(downstream).toHaveBeenCalledTimes(1)
    })

    it('replaces nested effects created again at the same execution slot', () => {
        const [parentValue, setParentValue] = state(0)
        const [childValue, setChildValue] = state(0)
        const childSpy = jest.fn()

        const dispose = effect(() => {
            parentValue()
            effect(() => childSpy(childValue()))
        })

        expect(childSpy).toHaveBeenCalledTimes(1)

        setParentValue(1)
        jest.advanceTimersToNextTimer()
        expect(childSpy).toHaveBeenCalledTimes(2)

        childSpy.mockClear()
        setChildValue(1)
        jest.advanceTimersToNextTimer()
        expect(childSpy).toHaveBeenCalledTimes(1)

        dispose()
    })
})
