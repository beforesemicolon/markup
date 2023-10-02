import { handleAttrDirectiveExecutable } from './handle-attr-directive-executable'
import { ExecutableValue } from '../types'

describe('handleAttrDirectiveExecutable', () => {
    let div: HTMLDivElement

    beforeEach(() => {
        div = document.createElement('div')
    })

    it('should handle style attribute', () => {
        const e1: ExecutableValue = {
            name: 'attr',
            rawValue: 'bold',
            value: '',
            renderedNode: div,
            prop: 'style.font-style',
            parts: [],
        }

        const e2: ExecutableValue = {
            name: 'attr',
            rawValue: 'background-color: #900 | true',
            value: '',
            renderedNode: div,
            prop: 'style',
            parts: [],
        }

        handleAttrDirectiveExecutable(e1, 'bold')
        handleAttrDirectiveExecutable(e2, 'background-color: #900 | true')

        expect(div.outerHTML).toBe(
            '<div style="font-style: bold; background-color: rgb(153, 0, 0);"></div>'
        )
        expect(e1.value).toBe('bold')
        expect(e2.value).toBe('background-color: #900 | true')

        handleAttrDirectiveExecutable(e2, 'background-color: #900 | false')

        expect(div.outerHTML).toBe('<div style="font-style: bold;"></div>')

        expect(e2.value).toBe('background-color: #900 | false')

        handleAttrDirectiveExecutable(e1, 'bold | false')

        expect(div.outerHTML).toBe('<div></div>')

        expect(e1.value).toBe('bold | false')
    })

    it('should handle class attribute', () => {
        const e1: ExecutableValue = {
            name: 'attr',
            rawValue: 'false',
            value: '',
            renderedNode: div,
            prop: 'class.simple-cls',
            parts: [],
        }

        const e2: ExecutableValue = {
            name: 'attr',
            rawValue: 'sample | true',
            value: '',
            renderedNode: div,
            prop: 'class',
            parts: [],
        }

        handleAttrDirectiveExecutable(e1, 'false')
        handleAttrDirectiveExecutable(e2, 'sample | true')

        expect(div.outerHTML).toBe('<div class="sample"></div>')
        expect(e1.value).toBe('false')
        expect(e2.value).toBe('sample | true')

        handleAttrDirectiveExecutable(e1, 'true')

        expect(div.outerHTML).toBe('<div class="sample simple-cls"></div>')

        expect(e1.value).toBe('true')

        handleAttrDirectiveExecutable(e2, 'sample | false')

        expect(div.outerHTML).toBe('<div class="simple-cls"></div>')

        expect(e2.value).toBe('sample | false')
    })

    it('should handle data attribute', () => {
        const e1: ExecutableValue = {
            name: 'attr',
            rawValue: 'val | true',
            value: '',
            renderedNode: div,
            prop: 'data.simple-val',
            parts: [],
        }

        const e2: ExecutableValue = {
            name: 'attr',
            rawValue: 'simple-val | true',
            value: '',
            renderedNode: div,
            prop: 'data',
            parts: [],
        }

        handleAttrDirectiveExecutable(e1, 'val | true')
        handleAttrDirectiveExecutable(e2, 'simple-val | true')

        expect(div.outerHTML).toBe('<div data-simple-val="val"></div>')
        expect(e1.value).toBe('val | true')
        expect(e2.value).toBe('simple-val | true')

        handleAttrDirectiveExecutable(e1, 'false')

        expect(div.outerHTML).toBe('<div></div>')

        expect(e1.value).toBe('false')
    })

    it('should handle boolean attribute', () => {
        const e1: ExecutableValue = {
            name: 'attr',
            rawValue: 'true',
            value: '',
            renderedNode: div,
            prop: 'disabled',
            parts: [],
        }

        const e2: ExecutableValue = {
            name: 'attr',
            rawValue: 'until-found | true',
            value: '',
            renderedNode: div,
            prop: 'hidden',
            parts: [],
        }

        handleAttrDirectiveExecutable(e1, 'true')
        handleAttrDirectiveExecutable(e2, 'until-found | true')

        expect(div.outerHTML).toBe(
            '<div disabled="" hidden="until-found"></div>'
        )
        expect(e1.value).toBe('true')
        expect(e2.value).toBe('until-found | true')

        handleAttrDirectiveExecutable(e1, 'false')

        expect(div.outerHTML).toBe('<div hidden="until-found"></div>')

        expect(e1.value).toBe('false')
    })

    it('should handle all other attributes', () => {
        const e1: ExecutableValue = {
            name: 'attr',
            rawValue: 'sample | true',
            value: '',
            renderedNode: div,
            prop: 'id',
            parts: [],
        }

        const e2: ExecutableValue = {
            name: 'attr',
            rawValue: 'true',
            value: '',
            renderedNode: div,
            prop: 'aria-disabled',
            parts: [],
        }

        handleAttrDirectiveExecutable(e1, 'sample | true')
        handleAttrDirectiveExecutable(e2, 'true')

        expect(div.outerHTML).toBe(
            '<div id="sample" aria-disabled="true"></div>'
        )
        expect(e1.value).toBe('sample | true')
        expect(e2.value).toBe('true')

        handleAttrDirectiveExecutable(e1, 'sample | false')

        expect(div.outerHTML).toBe('<div aria-disabled="true"></div>')
        expect(e1.value).toBe('sample | false')
    })
})
