import '../test.common.ts';
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
        expect(valueSpy2).toBeCalledTimes(4)
        expect(valueSpy2).toBeCalledWith(0)

        valueSpy1.mockClear()
        valueSpy2.mockClear()
        unsub()

        setCount(1)
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
})
