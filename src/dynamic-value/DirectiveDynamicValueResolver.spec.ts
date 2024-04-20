import { DirectiveDynamicValueResolver } from './DirectiveDynamicValueResolver'

describe('DirectiveDynamicValueResolver', () => {
    let div: HTMLDivElement
    
    beforeEach(() => {
        div = document.createElement('div')
    })
    
    it('should handle style attribute', () => {
        const e1 = new DirectiveDynamicValueResolver(
            'style',
            'bold | true',
            ['bold | true'],
            [div],
            'font-style'
        )
        
        const e2 = new DirectiveDynamicValueResolver(
            'style',
            'background-color: #900 | true',
            ['background-color: #900 | true'],
            [div],
            ''
        )
        
        e1.resolve()
        e2.resolve()
        
        expect(div.outerHTML).toBe(
          '<div style="font-style: bold; background-color: rgb(153, 0, 0);"></div>'
        )
        expect(e1.data).toBe('bold | true')
        expect(e2.data).toBe('background-color: #900 | true')
        
        e2.value = ['background-color: #900 | false']

        e2.resolve()

        expect(div.outerHTML).toBe('<div style="font-style: bold;"></div>')

        expect(e2.data).toBe('background-color: #900 | false')
        
        e1.value = ['bold | false']

        e1.resolve()

        expect(div.outerHTML).toBe('<div></div>')

        expect(e1.data).toBe('bold | false')
    })
    
    it('should handle class attribute', () => {
        const e1 = new DirectiveDynamicValueResolver(
                'class',
                'false',
                ['false'],
                [div],
                'simple-cls'
            )

        const e2 = new DirectiveDynamicValueResolver(
                'class',
                'sample | true',
                ['sample | true'],
                [div],
                ''
            )

        e1.resolve()
        e2.resolve()

        expect(div.outerHTML).toBe('<div class="sample"></div>')
        expect(e1.data).toBe('false')
        expect(e2.data).toBe('sample | true')
        
        e1.value = ['true']

        e1.resolve()

        expect(div.outerHTML).toBe('<div class="sample simple-cls"></div>')

        expect(e1.data).toBe('true')
        
        e2.value = ['sample | false']

        e2.resolve()

        expect(div.outerHTML).toBe('<div class="simple-cls"></div>')

        expect(e2.data).toBe('sample | false')
    })

    it('should handle data attribute', () => {
        const e1 = new DirectiveDynamicValueResolver(
                'data',
                'val | true',
                ['val | true'],
                [div],
                'simple-val'
            );

        const e2 = new DirectiveDynamicValueResolver(
            'data',
            'simple-val | true',
            ['simple-val | true'],
            [div],
            ''
        );

        e1.resolve()
        e2.resolve()

        expect(div.outerHTML).toBe('<div data-simple-val="val"></div>')
        expect(e1.data).toBe('val | true')
        expect(e2.data).toBe('simple-val | true')

        e1.value  = ['false']
        
        e1.resolve()

        expect(div.outerHTML).toBe('<div></div>')

        expect(e1.data).toBe('false')
    })

    it('should handle boolean attribute', () => {
        const e1 = new DirectiveDynamicValueResolver(
            'disabled',
            'true',
            ['true'],
            [div],
            ''
        )

        const e2 = new DirectiveDynamicValueResolver(
            'hidden',
            'until-found | true',
            ['until-found | true'],
            [div],
            ''
        );

        e1.resolve()
        e2.resolve()

        expect(div.outerHTML).toBe(
          '<div disabled="true" hidden="until-found"></div>'
        )
        expect(e1.data).toBe('true')
        expect(e2.data).toBe('until-found | true')

        e1.value = ['false']
        
        e1.resolve()

        expect(div.outerHTML).toBe('<div hidden="until-found"></div>')

        expect(e1.data).toBe('false')
    })

    it('should handle all other attributes', () => {
        const e1 = new DirectiveDynamicValueResolver(
            'id',
            'sample | true',
            ['sample | true'],
            [div],
            ''
        );

        const e2 = new DirectiveDynamicValueResolver(
            'aria-disabled',
            'true',
            ['true'],
            [div],
            ''
        );

        e1.resolve()
        e2.resolve()

        expect(div.outerHTML).toBe(
          '<div id="sample" aria-disabled="true"></div>'
        )
        expect(e1.data).toBe('sample | true')
        expect(e2.data).toBe('true')

        e1.value = ['sample | false']
        
        e1.resolve()

        expect(div.outerHTML).toBe('<div aria-disabled="true"></div>')
        expect(e1.data).toBe('sample | false')
    })
})
