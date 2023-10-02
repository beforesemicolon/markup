import { element } from './element.helper'

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
            '<my-button id="btn" disabled="false"><span>click me</span></my-button>'
        )
    })

    it('should set event listeners', () => {
        const clickMock = jest.fn()

        const el = element('button', {
            attributes: {
                onclick: clickMock,
            },
        })

        el.click()

        expect(clickMock).toHaveBeenCalled()
        expect(el.outerHTML).toBe('<button></button>')
    })
})
