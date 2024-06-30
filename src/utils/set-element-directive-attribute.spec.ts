import { setElementDirectiveAttribute } from './set-element-directive-attribute'

describe('setElementDirectiveAttribute', () => {
    let div: HTMLDivElement
    
    beforeEach(() => {
        div = document.createElement('div')
    })
    
    it('should handle style attribute', () => {
        setElementDirectiveAttribute(
            'style',
            'font-style',
            ['bold | true'],
            div,
        )
        
        setElementDirectiveAttribute(
            'style',
            '',
            ['background-color: #900 | true'],
            div,
        )
        
        expect(div.outerHTML).toBe(
            '<div style="font-style: bold; background-color: rgb(153, 0, 0);"></div>',
        )
        
        setElementDirectiveAttribute(
            'style',
            '',
            ['background-color: #900 | false'],
            div,
        )
        
        expect(div.outerHTML).toBe('<div style="font-style: bold;"></div>')
        
        setElementDirectiveAttribute(
            'style',
            'font-style',
            ['bold | false'],
            div,
        )
        
        expect(div.outerHTML).toBe('<div></div>')
    })
    
    it('should handle class attribute', () => {
        setElementDirectiveAttribute(
            'class',
            'simple-cls',
            ['false'],
            div,
        )
        
        setElementDirectiveAttribute(
            'class',
            '',
            ['sample | true'],
            div,
        )
        
        expect(div.outerHTML).toBe('<div class="sample"></div>')
        
        setElementDirectiveAttribute(
            'class',
            'simple-cls',
            ['true'],
            div,
        )
        
        expect(div.outerHTML).toBe('<div class="sample simple-cls"></div>')
        
        setElementDirectiveAttribute(
            'class',
            '',
            ['sample | false'],
            div,
        )
        
        expect(div.outerHTML).toBe('<div class="simple-cls"></div>')
    })
    
    it('should handle data attribute', () => {
        setElementDirectiveAttribute(
            'data',
            'simple-val',
            ['val | true'],
            div,
        )
        
        setElementDirectiveAttribute(
            'data',
            '',
            ['simple-val | true'],
            div,
        )
        
        
        expect(div.outerHTML).toBe('<div data-simple-val="val"></div>')
        
        setElementDirectiveAttribute(
            'data',
            'simple-val',
            ['false'],
            div,
        )
        
        expect(div.outerHTML).toBe('<div></div>')
    })
    
    it('should handle boolean attribute', () => {
        setElementDirectiveAttribute(
            'disabled',
            '',
            ['true'],
            div
        )

        setElementDirectiveAttribute(
            'hidden',
            '',
            ['until-found | true'],
            div,
            
        );

        expect(div.outerHTML).toBe(
          '<div disabled="true" hidden="until-found"></div>'
        )
        
        setElementDirectiveAttribute(
            'disabled',
            '',
            ['false'],
            div
        )

        expect(div.outerHTML).toBe('<div hidden="until-found"></div>')

    })

    it('should handle all other attributes', () => {
        setElementDirectiveAttribute(
            'id',
            '',
            ['sample | true'],
            div,
        );

        setElementDirectiveAttribute(
            'aria-disabled',
            '',
            ['true'],
            div
        );

        expect(div.outerHTML).toBe(
          '<div id="sample" aria-disabled="true"></div>'
        )
        
        setElementDirectiveAttribute(
            'id',
            '',
            ['sample | false'],
            div,
        );

        expect(div.outerHTML).toBe('<div aria-disabled="true"></div>')
    })
})
