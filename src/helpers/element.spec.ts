import { element } from './element.ts'

describe('element', () => {
    it('should create an element with name only', () => {
        const el = element('div')

        expect(el).toBeInstanceOf(HTMLDivElement)
        expect(el.outerHTML).toBe('<div></div>')
    })

    it('should create an element with attributes', () => {
        const el = element('div', {
            attributes: {
                id: 'sample',
                dataTestid: 'sample',
            },
        })

        expect(el).toBeInstanceOf(HTMLDivElement)
        expect(el.outerHTML).toBe(
            '<div id="sample" data-testid="sample"></div>'
        )
    })

    it('should create an element with attributes and text content', () => {
        const el = element('div', {
            attributes: {
                id: 'sample',
                dataTestid: 'sample',
            },
            textContent: 'sample',
        })

        expect(el).toBeInstanceOf(HTMLDivElement)
        expect(el.outerHTML).toBe(
            '<div id="sample" data-testid="sample">sample</div>'
        )
    })

    it('should create an element with attributes and html content', () => {
        const el = element('div', {
            attributes: {
                id: 'sample',
                dataTestid: 'sample',
            },
            htmlContent: '<span>sample</span>',
        })

        expect(el).toBeInstanceOf(HTMLDivElement)
        expect(el.outerHTML).toBe(
            '<div id="sample" data-testid="sample"><span>sample</span></div>'
        )
    })

    it('should create an svg element', () => {
        const el = element('svg', {
            attributes: {
                width: '100',
                height: '100',
                viewbox: '0 0 100 100',
            },
            htmlContent:
                '<circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />',
            ns: 'http://www.w3.org/2000/svg',
        })

        expect(el).toBeInstanceOf(SVGElement)
        expect(el.outerHTML).toBe(
            '<svg width="100" height="100" viewbox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow"></circle></svg>'
        )
    })

    it('should create a web component element with attributes', () => {
        class MyButton extends HTMLElement {
            static observedAttributes = ['disabled']
            disabled = false
        }

        customElements.define('my-button', MyButton)

        const el = element('my-button', {
            attributes: {
                id: 'btn',
                disabled: 'false',
            },
            htmlContent: '<span>click me</span>',
        })

        expect(el).toBeInstanceOf(MyButton)
        expect(el.outerHTML).toBe(
            '<my-button id="btn"><span>click me</span></my-button>'
        )
    })

    it('should set event listeners', () => {
        const clickMock = jest.fn()

        const el = element('button', {
            attributes: {
                onclick: clickMock,
            },
        }) as HTMLElement

        el.click()

        expect(clickMock).toHaveBeenCalled()
        expect(el.outerHTML).toBe('<button></button>')
    })
    
    it('should throw in no name provided', () => {
        expect(() => element('')).toThrowError('Invalid tagName => ')
    })
    
    it('should pass data to WC', () => {
        const valSetter = jest.fn();
        
        class SampleComp extends HTMLElement {
            set val(x: any) {
                valSetter(x)
            }
        }
        
        customElements.define('sample-comp', SampleComp)
        
        const el = element('sample-comp', {
            attributes: {
                val: {name: 'x'}
            }
        })
        
        
        expect(valSetter).toHaveBeenCalledWith({"name": "x"})
    })
    
    it('should create with childNodes and htmlContent', () => {
        expect(element('ul', {
            attributes: {id: 'items-list'},
            childNodes: [
                element('li', {
                    attributes: {class: 'list-item'},
                    textContent: 'item 1'
                }),
                element('li', {
                    attributes: {class: 'list-item'},
                    textContent: 'item 2'
                }),
                element('li', {
                    attributes: {class: 'list-item'},
                    textContent: 'item 3'
                })
            ]
        }).outerHTML).toBe('<ul id="items-list">' +
            '<li class="list-item">item 1</li>' +
            '<li class="list-item">item 2</li>' +
            '<li class="list-item">item 3</li>' +
            '</ul>')
        
        expect(element('ul', {
            attributes: { id: 'items-list' },
            htmlContent:
                '<li class="list-item">item 1</li>' +
                '<li class="list-item">item 2</li>' +
                '<li class="list-item">item 3</li>',
        }).outerHTML).toBe('<ul id="items-list">' +
            '<li class="list-item">item 1</li>' +
            '<li class="list-item">item 2</li>' +
            '<li class="list-item">item 3</li>' +
            '</ul>')
        
        
    })
})
