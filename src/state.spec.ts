import '../test.common.ts';
import { html } from './html.ts'
import { effect, state } from './state.ts'

describe('state', () => {
    it('should work correctly', () => {
        const onUpdate = jest.fn()
        
        const [count, setCount, unsub]= state(0, onUpdate);
        
        expect(count()).toBe(0)
        
        let newValue = setCount(1)
        
        expect(count()).toBe(newValue)
        jest.advanceTimersToNextTimer()
        expect(onUpdate).toBeCalledTimes(1)
        
        onUpdate.mockClear()
        unsub()
        
        newValue = setCount(2)
        
        jest.advanceTimersToNextTimer()
        expect(count()).toBe(newValue)
        expect(onUpdate).toBeCalledTimes(0)
    })
    
    it('should batch update', () => {
        const onUpdate = jest.fn()
        const [, setCount]= state(0, onUpdate);
        const [, setLimit]= state(0, onUpdate);
        
        setCount(2)
        setLimit(10)
        jest.advanceTimersToNextTimer()
        
        expect(onUpdate).toBeCalledTimes(1)
    })
})

describe('effect', () => {
    it('should work correctly', () => {
        const valueSpy = jest.fn()
        const [count, setCount]= state(0);
        
        const unsub = effect(() => {
            valueSpy(count())
        })
        
        expect(valueSpy).toBeCalledTimes(1)
        expect(valueSpy).toBeCalledWith(0)
        
        setCount(1)
        jest.advanceTimersToNextTimer()
        
        expect(valueSpy).toBeCalledTimes(2)
        expect(valueSpy).toBeCalledWith(1)
        
        valueSpy.mockClear()
        unsub()
        
        setCount(2)
        jest.advanceTimersToNextTimer()
        
        expect(valueSpy).toBeCalledTimes(0)
    })

    it('should batch multiple dependency updates into one execution', () => {
        const valueSpy = jest.fn()
        const [count, setCount]= state(0);
        const [limit, setLimit]= state(0);
        const [offset, setOffset]= state(0);

        effect(() => {
            valueSpy(count(), limit(), offset())
        })

        setCount(1)
        setLimit(2)
        setOffset(3)
        jest.advanceTimersToNextTimer()

        expect(valueSpy).toBeCalledTimes(2)
        expect(valueSpy).toHaveBeenLastCalledWith(1, 2, 3)
    })
    
    it('should work correctly when nested for different values', () => {
        const valueSpy1 = jest.fn()
        const valueSpy2 = jest.fn()
        const [count, setCount]= state(0);
        const [total, setTotal]= state(0);
        
        const unsub = effect(() => {
            valueSpy1(count())
            effect(() => {
                valueSpy2(total())
            })
        })
        
        expect(valueSpy1).toBeCalledTimes(1)
        expect(valueSpy1).toBeCalledWith(0)
        expect(valueSpy2).toBeCalledTimes(1)
        expect(valueSpy2).toBeCalledWith(0)
        
        setCount(1)
        jest.advanceTimersToNextTimer()

        expect(valueSpy1).toBeCalledTimes(2)
        expect(valueSpy1).toBeCalledWith(1)
        expect(valueSpy2).toBeCalledTimes(2)
        expect(valueSpy2).toBeCalledWith(0)

        valueSpy1.mockClear()
        valueSpy2.mockClear()
        unsub()

        setCount(1)
        jest.advanceTimersToNextTimer()

        expect(valueSpy1).toBeCalledTimes(0)
        expect(valueSpy2).toBeCalledTimes(0)

        setTotal(10)
        jest.advanceTimersToNextTimer()

        expect(valueSpy1).toBeCalledTimes(0)
        expect(valueSpy2).toBeCalledTimes(0)
    })
    
    it('should work correctly when nested for same values', () => {
        const valueSpy1 = jest.fn()
        const valueSpy2 = jest.fn()
        const [count, setCount]= state(0);
        
        const unsub = effect(() => {
            valueSpy1(count())
            effect(() => {
                valueSpy2(count())
            })
        })
        
        expect(valueSpy1).toBeCalledTimes(1)
        expect(valueSpy1).toBeCalledWith(0)
        expect(valueSpy2).toBeCalledTimes(1)
        expect(valueSpy2).toBeCalledWith(0)
        
        setCount(1)
        jest.advanceTimersToNextTimer()

        expect(valueSpy1).toBeCalledTimes(2)
        expect(valueSpy1).toBeCalledWith(1)
        expect(valueSpy2).toBeCalledTimes(2)
        expect(valueSpy2).toBeCalledWith(1)

        valueSpy1.mockClear()
        valueSpy2.mockClear()
        unsub()

        setCount(2)
        jest.advanceTimersToNextTimer()

        expect(valueSpy1).toBeCalledTimes(0)
        expect(valueSpy2).toBeCalledTimes(0)
    })
    
    it('should work correctly when there is a conditional state', () => {
        const valueSpy = jest.fn()
        const [count, setCount]= state(0);
        const [total, setTotal]= state(0);
        
        const unsub = effect(() => {
            if (count() > 0) {
                setTotal(count())
                valueSpy(total())
            }
        })
        
        expect(valueSpy).not.toHaveBeenCalled()
        
        valueSpy.mockClear()
        setTotal(10)
        
        expect(valueSpy).toHaveBeenCalledTimes(0)
        expect(total()).toBe(10)
        
        valueSpy.mockClear()
        setCount(1)
        jest.advanceTimersToNextTimer()
        
        expect(valueSpy).toHaveBeenCalledTimes(1)
        expect(valueSpy).toHaveBeenCalledWith(1)
        expect(total()).toBe(1)
        
        valueSpy.mockClear()
        setTotal(10)
        jest.advanceTimersToNextTimer()

        expect(valueSpy).toHaveBeenCalledTimes(1)
        expect(valueSpy).toHaveBeenCalledWith(1)
        expect(total()).toBe(1)
        
        unsub()

        valueSpy.mockClear()
        setTotal(20)
        setCount(2)
        jest.advanceTimersToNextTimer()

        expect(valueSpy).toHaveBeenCalledTimes(0)
        expect(total()).toBe(20)
        expect(count()).toBe(2)
    })

    it('should unsubscribe from dependencies that are no longer read', () => {
        const valueSpy = jest.fn()
        const [enabled, setEnabled] = state(true)
        const [count, setCount] = state(0)

        effect(() => {
            valueSpy(enabled() ? count() : 'disabled')
        })

        expect(valueSpy).toHaveBeenLastCalledWith(0)

        setEnabled(false)
        jest.advanceTimersToNextTimer()

        expect(valueSpy).toHaveBeenLastCalledWith('disabled')

        valueSpy.mockClear()
        setCount(1)
        jest.advanceTimersToNextTimer()

        expect(valueSpy).not.toHaveBeenCalled()
    })

    it('should discover dependencies again when conditional branches change', () => {
        const valueSpy = jest.fn()
        const [useCount, setUseCount] = state(true)
        const [count, setCount] = state(0)
        const [total, setTotal] = state(10)

        effect(() => {
            valueSpy(useCount() ? count() : total())
        })

        setUseCount(false)
        jest.advanceTimersToNextTimer()

        valueSpy.mockClear()
        setCount(1)
        jest.advanceTimersToNextTimer()
        expect(valueSpy).not.toHaveBeenCalled()

        setTotal(20)
        jest.advanceTimersToNextTimer()
        expect(valueSpy).toHaveBeenCalledTimes(1)
        expect(valueSpy).toHaveBeenLastCalledWith(20)

        valueSpy.mockClear()
        setUseCount(true)
        jest.advanceTimersToNextTimer()
        expect(valueSpy).toHaveBeenLastCalledWith(1)

        valueSpy.mockClear()
        setTotal(30)
        jest.advanceTimersToNextTimer()
        expect(valueSpy).not.toHaveBeenCalled()

        setCount(2)
        jest.advanceTimersToNextTimer()
        expect(valueSpy).toHaveBeenCalledTimes(1)
        expect(valueSpy).toHaveBeenLastCalledWith(2)
    })

    it('should keep retained template effects alive across parent reruns', () => {
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

    it('should not run an explicitly disposed effect that is already queued', () => {
        const [count, setCount] = state(0)
        const spy = jest.fn()
        const dispose = effect(() => spy(count()))

        spy.mockClear()
        setCount(1)
        dispose()
        jest.advanceTimersToNextTimer()

        expect(spy).not.toHaveBeenCalled()
    })

    it('should drain downstream state updates in the same flush', () => {
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

    it('should execute each subscriber at most once when a downstream effect creates a cycle', () => {
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

    it('should replace nested effects created again at the same execution slot', () => {
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
