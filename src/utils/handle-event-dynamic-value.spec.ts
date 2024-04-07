import { handleEventDynamicValue } from "./handle-event-dynamic-value";
import { DynamicValueType } from "../types";

describe('handleEventDynamicValue', () => {
    it('should throw error if no function is provided', () => {
        const btn = document.createElement('button');
        
        expect(() => handleEventDynamicValue({
            type: DynamicValueType.Event,
            name: 'click',
            value: [],
            renderedNodes: [btn],
            prop: '',
            data: null,
            rawValue: '$val0'
        })).toThrowError('handler for event "click" is not a function. Found "undefined".')
    })
    it('should set event listener', () => {
        const btn = document.createElement('button');
        const fn = jest.fn();
        
        handleEventDynamicValue({
            type: DynamicValueType.Event,
            name: 'onclick',
            value: [fn],
            renderedNodes: [btn],
            prop: 'click',
            data: null,
            rawValue: '$val0',
        })
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(3)
    })
    
    it('should set event listener with boolean option', () => {
        const box = document.createElement('div');
        const fn = jest.fn();
        
        handleEventDynamicValue({
            type: DynamicValueType.Event,
            name: 'onscroll',
            value: [fn, true],
            renderedNodes: [box],
            prop: 'scroll',
            data: null,
            rawValue: '$val0',
        })
        
        const scrollEvent = new Event('scroll');
        box.dispatchEvent(scrollEvent)
        box.dispatchEvent(scrollEvent)
        box.dispatchEvent(scrollEvent)
        
        expect(fn).toHaveBeenCalledTimes(3)
    })
    
    it('should set event listener with object option', () => {
        const btn = document.createElement('button');
        const fn = jest.fn();
        
        handleEventDynamicValue({
            type: DynamicValueType.Event,
            name: 'onclick',
            value: [fn, {once: true}],
            renderedNodes: [btn],
            prop: 'click',
            data: null,
            rawValue: '$val0',
        })
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(1)
    })
    
    it('should set event listener with string option', () => {
        const btn = document.createElement('button');
        const fn = jest.fn();
        
        handleEventDynamicValue({
            type: DynamicValueType.Event,
            name: 'onclick',
            value: [fn],
            renderedNodes: [btn],
            prop: 'click',
            data: null,
            rawValue: '$val0,{"once": true}',
        })
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(1)
    })
    
    it('should set event listener without string option if invalid', () => {
        const btn = document.createElement('button');
        const fn = jest.fn();
        
        handleEventDynamicValue({
            type: DynamicValueType.Event,
            name: 'onclick',
            value: [fn],
            renderedNodes: [btn],
            prop: 'click',
            data: null,
            rawValue: '$val0, sample',
        })
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(3)
    })
})
