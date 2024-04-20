import { resolveContentDynamicValueToNodes } from './resolve-content-dynamic-value-to-nodes'
import { element } from '../utils/element'
import { when } from '../helpers'
import { html } from '../html'

describe('resolveContentDynamicValueToNodes', () => {
    
    it('should resolve text value', () => {
        const data = 'hello';
        let renderedNodes: Node[] = [document.createTextNode('$val0')]
        let res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res).toHaveLength(1)
        expect(res[0]).not.toEqual(renderedNodes[0])
        expect(res[0].textContent).toBe('hello')
        
        const node = res[0]
        
        renderedNodes = [...res]
        
        res = resolveContentDynamicValueToNodes('hello', renderedNodes)
        
        expect(res[0]).toEqual(node)
        expect(res[0].textContent).toBe('hello')
    })
    
    it('should resolve node value', () => {
        const data = element('p', { textContent: 'sample' });
        let renderedNodes: Node[] = [document.createTextNode('$val0')]
        let res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res).toHaveLength(1)
        expect(res[0]).not.toEqual(renderedNodes[0])
        expect(res[0].textContent).toBe('sample')
        
        const node = res[0]
        
        renderedNodes = [...res]
        
        res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res[0]).toEqual(node)
        expect(res[0].textContent).toBe('sample')
    })
    
    it('should resolve function value', () => {
        let total = 12
        const data = () => total;
        let renderedNodes: Node[] = [document.createTextNode('$val0')]
        let res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res).toHaveLength(1)
        expect(res[0]).not.toEqual(renderedNodes[0])
        expect(res[0].textContent).toBe('12')
        
        let node = res[0]
        
        renderedNodes = [...res]
        
        res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res[0]).toEqual(node)
        expect(res[0].textContent).toBe('12')
        
        total = 24
        
        node = res[0]
        
        renderedNodes = [...res]
        
        res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res[0]).not.toEqual(node)
        expect(res[0].textContent).toBe('24')
    })
    
    it('should resolve helper value', () => {
        let v = true
        const data = when(() => v, 'is truthy', 'is falsy');
        let renderedNodes: Node[] = [document.createTextNode('$val0')]
        let res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res).toHaveLength(1)
        expect(res[0]).not.toEqual(renderedNodes[0])
        expect(res[0].textContent).toBe('is truthy')
        
        let node = res[0]
        
        renderedNodes = [...res]
        
        res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res[0]).toEqual(node)
        expect(res[0].textContent).toBe('is truthy')
        
        v = false
        
        node = res[0]
        
        renderedNodes = [...res]
        
        res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res[0]).not.toEqual(node)
        expect(res[0].textContent).toBe('is falsy')
    })
    
    it('should resolve array value', () => {
        const data = [[['x', 12]]];
        let renderedNodes: Node[] = [document.createTextNode('$val0')]
        let res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res).toHaveLength(2)
        expect(res).not.toEqual(renderedNodes)
        expect(res[0].nodeValue).toBe('x')
        expect(res[1].nodeValue).toBe('12')
    })
    
    it('should resolve HTML template', () => {
        const data = html`sample`;
        let renderedNodes: Node[] = [document.createTextNode('$val0')]
        let res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res).toHaveLength(1)
        expect(res).not.toEqual(renderedNodes)
        expect(res[0].nodeValue).toBe('sample')
        
        res = resolveContentDynamicValueToNodes(data, renderedNodes)
        
        expect(res[0].nodeValue).toBe('sample')
    })
})
