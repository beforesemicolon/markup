import { DynamicValue, DynamicValueType } from "../types";
import { handleDirectiveDynamicValue } from "./handle-directive-dynamic-value";

describe('handleDirectiveDynamicValue', () => {
    let div: HTMLDivElement
    
    beforeEach(() => {
        div = document.createElement('div')
    })
    
    it('should handle style attribute', () => {
        const e1: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'style',
            rawValue: 'bold | true',
            value: ['bold | true'],
            renderedNodes: [div],
            prop: 'font-style',
            data: '',
        }
        
        const e2: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'style',
            rawValue: 'background-color: #900 | true',
            value: ['background-color: #900 | true'],
            renderedNodes: [div],
            prop: '',
            data: '',
        }
        
        handleDirectiveDynamicValue(e1)
        handleDirectiveDynamicValue(e2)
        
        expect(div.outerHTML).toBe(
          '<div style="font-style: bold; background-color: rgb(153, 0, 0);"></div>'
        )
        expect(e1.data).toBe('bold | true')
        expect(e2.data).toBe('background-color: #900 | true')
        
        e2.value = ['background-color: #900 | false']

        handleDirectiveDynamicValue(e2)

        expect(div.outerHTML).toBe('<div style="font-style: bold;"></div>')

        expect(e2.data).toBe('background-color: #900 | false')
        
        e1.value = ['bold | false']

        handleDirectiveDynamicValue(e1)

        expect(div.outerHTML).toBe('<div></div>')

        expect(e1.data).toBe('bold | false')
    })
    
    it('should handle class attribute', () => {
        const e1: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'class',
            rawValue: 'false',
            value: ['false'],
            renderedNodes: [div],
            prop: 'simple-cls',
            data: '',
        }

        const e2: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'class',
            rawValue: 'sample | true',
            value: ['sample | true'],
            renderedNodes: [div],
            prop: '',
            data: '',
        }

        handleDirectiveDynamicValue(e1)
        handleDirectiveDynamicValue(e2)

        expect(div.outerHTML).toBe('<div class="sample"></div>')
        expect(e1.data).toBe('false')
        expect(e2.data).toBe('sample | true')
        
        e1.value = ['true']

        handleDirectiveDynamicValue(e1)

        expect(div.outerHTML).toBe('<div class="sample simple-cls"></div>')

        expect(e1.data).toBe('true')
        
        e2.value = ['sample | false']

        handleDirectiveDynamicValue(e2)

        expect(div.outerHTML).toBe('<div class="simple-cls"></div>')

        expect(e2.data).toBe('sample | false')
    })

    it('should handle data attribute', () => {
        const e1: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'data',
            rawValue: 'val | true',
            value: ['val | true'],
            renderedNodes: [div],
            prop: 'simple-val',
            data: '',
        }

        const e2: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'data',
            rawValue: 'simple-val | true',
            value: ['simple-val | true'],
            renderedNodes: [div],
            prop: '',
            data: '',
        }

        handleDirectiveDynamicValue(e1)
        handleDirectiveDynamicValue(e2)

        expect(div.outerHTML).toBe('<div data-simple-val="val"></div>')
        expect(e1.data).toBe('val | true')
        expect(e2.data).toBe('simple-val | true')

        e1.value  = ['false']
        
        handleDirectiveDynamicValue(e1)

        expect(div.outerHTML).toBe('<div></div>')

        expect(e1.data).toBe('false')
    })

    it('should handle boolean attribute', () => {
        const e1: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'disabled',
            rawValue: 'true',
            value: ['true'],
            renderedNodes: [div],
            prop: '',
            data: '',
        }

        const e2: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'hidden',
            rawValue: 'until-found | true',
            value: ['until-found | true'],
            renderedNodes: [div],
            prop: '',
            data: '',
        }

        handleDirectiveDynamicValue(e1)
        handleDirectiveDynamicValue(e2)

        expect(div.outerHTML).toBe(
          '<div disabled="true" hidden="until-found"></div>'
        )
        expect(e1.data).toBe('true')
        expect(e2.data).toBe('until-found | true')

        e1.value = ['false']
        
        handleDirectiveDynamicValue(e1)

        expect(div.outerHTML).toBe('<div hidden="until-found"></div>')

        expect(e1.data).toBe('false')
    })

    it('should handle all other attributes', () => {
        const e1: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'id',
            rawValue: 'sample | true',
            value: ['sample | true'],
            renderedNodes: [div],
            prop: '',
            data: '',
        }

        const e2: DynamicValue<Array<unknown>, string> = {
            type: DynamicValueType.Directive,
            name: 'aria-disabled',
            rawValue: 'true',
            value: ['true'],
            renderedNodes: [div],
            prop: '',
            data: '',
        }

        handleDirectiveDynamicValue(e1)
        handleDirectiveDynamicValue(e2)

        expect(div.outerHTML).toBe(
          '<div id="sample" aria-disabled="true"></div>'
        )
        expect(e1.data).toBe('sample | true')
        expect(e2.data).toBe('true')

        e1.value = ['sample | false']
        
        handleDirectiveDynamicValue(e1)

        expect(div.outerHTML).toBe('<div aria-disabled="true"></div>')
        expect(e1.data).toBe('sample | false')
    })
})
