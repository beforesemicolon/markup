import '../test.common.ts'
import { state } from './state.ts'

describe('state api', () => {
    it('should return the updated value from the setter', () => {
        const [count, setCount] = state(0)

        const updatedValue: number = setCount(1)

        expect(updatedValue).toBe(1)
        expect(count()).toBe(1)
    })

    it('should apply updater functions synchronously in sequence', () => {
        const [count, setCount] = state(1)

        expect(setCount((value) => value + 1)).toBe(2)
        expect(setCount((value) => value * 3)).toBe(6)
        expect(count()).toBe(6)
    })

    it('should use Object.is semantics when deciding whether a value changed', () => {
        const onUpdate = jest.fn()
        const [value, setValue] = state<number>(NaN, onUpdate)

        setValue(NaN)
        jest.advanceTimersToNextTimer()

        expect(onUpdate).not.toHaveBeenCalled()
        expect(Number.isNaN(value())).toBe(true)

        setValue(0)
        jest.advanceTimersToNextTimer()
        onUpdate.mockClear()

        setValue(-0)
        jest.advanceTimersToNextTimer()

        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(Object.is(value(), -0)).toBe(true)
    })

    it('should not call an explicit subscriber if it unsubscribes before the flush', () => {
        const onUpdate = jest.fn()
        const [, setCount, unsubscribe] = state(0, onUpdate)

        setCount(1)
        unsubscribe()
        jest.advanceTimersToNextTimer()

        expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should support function values by returning them from an updater', () => {
        const initialHandler = jest.fn()
        const nextHandler = jest.fn()
        const [handler, setHandler] = state<() => void>(initialHandler)

        const updatedHandler = setHandler(() => nextHandler)

        expect(updatedHandler).toBe(nextHandler)
        expect(handler()).toBe(nextHandler)

        handler()()
        expect(nextHandler).toHaveBeenCalledTimes(1)
        expect(initialHandler).not.toHaveBeenCalled()
    })

    it('should not notify when a function-valued state resolves to the same function', () => {
        const handler = jest.fn()
        const onUpdate = jest.fn()
        const [getHandler, setHandler] = state<() => void>(handler, onUpdate)

        setHandler(() => handler)
        jest.advanceTimersToNextTimer()

        expect(getHandler()).toBe(handler)
        expect(onUpdate).not.toHaveBeenCalled()
    })
})
