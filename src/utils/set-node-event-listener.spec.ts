import { setNodeEventListener } from './set-node-event-listener'

describe('setNodeEventListener', () => {
    it('should throw error if no function is provided', () => {
        const btn = document.createElement('button')
        
        expect(() => setNodeEventListener('click', '$val0', [], btn)).toThrowError('Handler for event "click" is not a function. Found "undefined".')
    })
    it('should set event listener', () => {
        const btn = document.createElement('button')
        const fn = jest.fn()
        
        setNodeEventListener('onclick', '$val0', [fn], btn)
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(3)
    })
    
    it('should set event listener with boolean option', () => {
        const box = document.createElement('div')
        const fn = jest.fn()
        
        setNodeEventListener('onscroll', '$val0', [fn, true], box)
        
        const scrollEvent = new Event('scroll')
        box.dispatchEvent(scrollEvent)
        box.dispatchEvent(scrollEvent)
        box.dispatchEvent(scrollEvent)
        
        expect(fn).toHaveBeenCalledTimes(3)
    })
    
    it('should set event listener with object option', () => {
        const btn = document.createElement('button')
        const fn = jest.fn()
        
        setNodeEventListener('onclick', '$val0', [fn, { once: true }], btn)
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(1)
    })
    
    it('should set event listener with string option', () => {
        const btn = document.createElement('button')
        const fn = jest.fn()
        
        setNodeEventListener('onclick', '$val0,{"once": true}', [fn], btn)
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(1)
    })
    
    it('should set event listener without string option if invalid', () => {
        const btn = document.createElement('button')
        const fn = jest.fn()
        
        setNodeEventListener('onclick', '$val0, sample', [fn], btn)
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(3)
    })
})
