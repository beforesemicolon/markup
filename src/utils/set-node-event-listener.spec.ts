import { setNodeEventListener } from './set-node-event-listener'

describe('setNodeEventListener', () => {
    it('should throw error if no function is provided', () => {
        const btn = document.createElement('button')
        
        // @ts-ignore
        expect(() => setNodeEventListener(btn, 'click')).toThrowError('Handler for event "click" is not a function. Found "undefined".')
    })
    it('should set event listener', () => {
        const btn = document.createElement('button')
        const fn = jest.fn()
        
        setNodeEventListener(btn, 'onclick', fn)
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(3)
    })
    
    it('should set event listener with boolean option', () => {
        const box = document.createElement('div')
        const fn = jest.fn()
        
        setNodeEventListener(box, 'onscroll', fn, true)
        
        const scrollEvent = new Event('scroll')
        box.dispatchEvent(scrollEvent)
        box.dispatchEvent(scrollEvent)
        box.dispatchEvent(scrollEvent)
        
        expect(fn).toHaveBeenCalledTimes(3)
    })
    
    it('should set event listener with object option', () => {
        const btn = document.createElement('button')
        const fn = jest.fn()
        
        setNodeEventListener(btn, 'onclick', fn, { once: true })
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(1)
    })
    
    it('should set event listener with string option', () => {
        const btn = document.createElement('button')
        const fn = jest.fn()
        
        setNodeEventListener(btn, 'onclick', fn, {"once": true})
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(1)
    })
    
    it('should set event listener without string option if invalid', () => {
        const btn = document.createElement('button')
        const fn = jest.fn()
        
        // @ts-ignore
        setNodeEventListener(btn, 'onclick', fn, 'sample')
        
        btn.click()
        btn.click()
        btn.click()
        
        expect(fn).toHaveBeenCalledTimes(3)
    })
})
