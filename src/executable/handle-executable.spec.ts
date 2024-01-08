import { handleExecutable } from './handle-executable'
import { Executable } from '../types'
import { html } from '../html'

describe('handleExecutable', () => {
    let div: HTMLDivElement
    const refs = {}
    const defaultExec = {
        directives: [],
        content: [],
        attributes: [],
        events: [],
    }

    beforeEach(() => {
        div = document.createElement('div')
    })

    it('should handle event executable', () => {
        const fnMock1 = jest.fn()
        const fnMock2 = jest.fn()

        const e: Executable = {
            ...defaultExec,
            events: [
                {
                    name: 'scroll',
                    rawValue: '{{val0}}, true',
                    value: '{{val0}}',
                    renderedNodes: [div],
                    parts: [fnMock1],
                },
            ],
        }

        handleExecutable(div, e, refs)

        expect(e).toEqual({
            ...defaultExec,
            events: [
                {
                    name: 'scroll',
                    rawValue: '{{val0}}, true',
                    renderedNodes: [div],
                    value: fnMock1,
                    parts: [fnMock1],
                },
            ],
        })

        e.events[0].parts = [fnMock2]
        handleExecutable(div, e, refs)

        expect(e).toEqual({
            ...defaultExec,
            events: [
                {
                    name: 'scroll',
                    rawValue: '{{val0}}, true',
                    renderedNodes: [div],
                    value: fnMock2,
                    parts: [fnMock2],
                },
            ],
        })

        expect(div.outerHTML).toBe('<div></div>')

        e.events[0].parts = [null]
        expect(() => handleExecutable(div, e, refs)).toThrowError(
            'handler for event "scroll" is not a function. Found "null".'
        )
    })

    it('should handle attribute value executable', () => {
        const e: Executable = {
            ...defaultExec,
            attributes: [
                {
                    name: 'id',
                    rawValue: '{{val0}}',
                    value: '{{val0}}',
                    renderedNodes: [div],
                    parts: ['sample'],
                },
            ],
        }

        handleExecutable(div, e, refs)

        expect(e).toEqual({
            ...defaultExec,
            attributes: [
                {
                    name: 'id',
                    rawValue: '{{val0}}',
                    renderedNodes: [div],
                    value: 'sample',
                    parts: ['sample'],
                },
            ],
        })

        expect(div.outerHTML).toBe('<div id="sample"></div>')
    })

    it('should handle attribute directive executable', () => {
        const e: Executable = {
            ...defaultExec,
            directives: [
                {
                    name: 'disabled',
                    rawValue: 'true',
                    value: '',
                    renderedNodes: [div],
                    prop: '',
                    parts: [true],
                },
            ],
        }

        handleExecutable(div, e, refs)

        expect(e).toEqual({
            ...defaultExec,
            directives: [
                {
                    name: 'disabled',
                    prop: '',
                    rawValue: 'true',
                    renderedNodes: [div],
                    value: "true",
                    parts: [true],
                },
            ],
        })

        expect(div.outerHTML).toBe('<div disabled="true"></div>')
    })

    it('should handle text executable as text', () => {
        const txt = document.createTextNode('{{val0}}')
        div.appendChild(txt)

        const e: Executable = {
            ...defaultExec,
            content: [
                {
                    name: 'nodeValue',
                    rawValue: '{{val0}}',
                    value: '',
                    renderedNodes: [txt],
                    parts: ['sample'],
                },
            ],
        }

        handleExecutable(txt, e, refs)

        expect(div.outerHTML).toBe('<div>sample</div>')
    })

    it('should handle text executable as node', () => {
        const txt = document.createTextNode('{{val0}}')
        div.appendChild(txt)

        const p = document.createElement('p')

        const e: Executable = {
            ...defaultExec,
            content: [
                {
                    name: 'nodeValue',
                    rawValue: '{{val0}}',
                    value: '',
                    renderedNodes: [txt],
                    parts: [p],
                },
            ],
        }

        handleExecutable(txt, e, refs)

        expect(div.outerHTML).toBe('<div><p></p></div>')
    })

    it('should handle text executable as node', () => {
        const txt = document.createTextNode('{{val0}}')
        div.appendChild(txt)

        const p = html`<p>sample</p>`

        const e: Executable = {
            ...defaultExec,
            content: [
                {
                    name: 'nodeValue',
                    rawValue: '{{val0}}',
                    value: '',
                    renderedNodes: [txt],
                    parts: [p],
                },
            ],
        }

        handleExecutable(txt, e, refs)

        expect(div.outerHTML).toBe('<div><p>sample</p></div>')
    })

    it('should handle html string executable as text and encode entities', () => {
        const txt = document.createTextNode('{{val0}}')
        div.appendChild(txt)

        const e: Executable = {
            ...defaultExec,
            content: [
                {
                    name: 'nodeValue',
                    rawValue: '{{val0}}',
                    value: '',
                    renderedNodes: [txt],
                    parts: ['<p>sample</p>'],
                },
            ],
        }

        handleExecutable(txt, e, refs)

        expect(div.outerHTML).toBe('<div>&lt;p&gt;sample&lt;/p&gt;</div>')
    })
})
