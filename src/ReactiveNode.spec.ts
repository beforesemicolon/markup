import { ReactiveNode } from './ReactiveNode'
import { html, HtmlTemplate } from './html'
import { state } from './state'
import { is, when } from './helpers'
import { render } from 'node-sass'

describe('ReactiveNode', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })
    
    it('should render text', () => {
        const node = new ReactiveNode(() => 'sample', document.body)

        expect(document.body.innerHTML).toBe('sample')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(2)
    })
    
    it('should render primitive values', () => {
        const node = new ReactiveNode(() => [12, true, 'value'],document.body)

        expect(document.body.innerHTML).toBe('12truevalue')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)
    })
    
    it('should handle removing', () => {
        const node = new ReactiveNode(() => 'sample',document.body)

        expect(document.body.innerHTML).toBe('sample')
        expect(document.body.childNodes).toHaveLength(2)

        node.unmount()

        expect(document.body.innerHTML).toBe('')
        expect(document.body.childNodes).toHaveLength(0)
    })
    
    it('should render template', () => {
        const node = new ReactiveNode(() => html`<p>sample</p>`, document.body)

        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)
    })
    
    it('should render array', () => {
        const node = new ReactiveNode(() => [html`<p>sample</p>`, true], document.body)

        expect(document.body.innerHTML).toBe('<p>sample</p>true')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(5)
    })
    
    it('should render state', () => {
        const [value, updateValue] = state('sample')
        const node = new ReactiveNode(value, document.body)

        expect(document.body.innerHTML).toBe('sample')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(2)

        updateValue('new value')

        expect(document.body.innerHTML).toBe('new value')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(2)
    })
    
    it('should render template with state', () => {
        const [value, updateValue] = state('sample')
        const node = new ReactiveNode(() => html`<p>${value}</p>`, document.body)

        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)

        updateValue('new value')

        expect(document.body.innerHTML).toBe('<p>new value</p>')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)
    })
    
    it('should render conditional content', () => {
        const [value, updateValue] = state(true)
        const node = new ReactiveNode(() => {
            if (value()) {
                return html`<p>sample</p>`
            }

            return html`<p>diff</p>`
        }, document.body)

        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)

        updateValue(false)

        expect(document.body.innerHTML).toBe('<p>diff</p>')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)

        updateValue(true)

        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)
    })
    
    it('should render nested conditional content', () => {
        const [currentPlayer, setCurrentPlayer] = state('x')
        const [ended, setEnded] = state(false)

        new ReactiveNode(() => html`
            ${when(ended, html`
                ${when(is(currentPlayer, 'xy'),
                    html`tie`,
                    html`${currentPlayer} won`,
                )}
                <button type="button">reset</button>
            `)}
        `, document.body)

        expect(document.body.innerHTML).toBe('')

        setEnded(true)
        expect(document.body.innerHTML).toBe('x won\n' +
            '                <button type="button">reset</button>')

        setCurrentPlayer('xy')
        expect(document.body.innerHTML).toBe('tie\n' +
            '                <button type="button">reset</button>')

        setEnded(false)
        expect(document.body.innerHTML).toBe('')

        setCurrentPlayer('x')
        expect(document.body.innerHTML).toBe('')

        setEnded(true)
        expect(document.body.innerHTML).toBe('x won\n' +
            '                <button type="button">reset</button>')

        setCurrentPlayer('x')
        setEnded(false)
        expect(document.body.innerHTML).toBe('')
    })
    
    it('should CRUD list of templates', () => {
        const [todos, updateTodos] = state<HtmlTemplate[]>([])
        const node = new ReactiveNode(todos, document.body)

        expect(document.body.innerHTML).toBe('')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)

        updateTodos([
            html`
                <li>todo 1</li>`,
        ])

        expect(document.body.innerHTML).toBe('<li>todo 1</li>')

        updateTodos([
            html`<li>todo 2</li>`,
            ...todos(),
            html`<li>todo 3</li>`,
        ])

        expect(document.body.innerHTML).toBe('<li>todo 2</li><li>todo 1</li><li>todo 3</li>')

        updateTodos([
            todos()[2],
            todos()[0],
            todos()[1],
        ])

        expect(document.body.innerHTML).toBe('<li>todo 3</li><li>todo 2</li><li>todo 1</li>')

        updateTodos([
            todos()[0],
            todos()[2],
        ])

        expect(document.body.innerHTML).toBe('<li>todo 3</li><li>todo 1</li>')

        updateTodos([
            todos()[1],
        ])

        expect(document.body.innerHTML).toBe('<li>todo 1</li>')

        updateTodos([])

        expect(document.body.innerHTML).toBe('')
        
        updateTodos([
            html`<li>todo 1</li>`,
            html`<li>todo 2</li>`,
            html`<li>todo 3</li>`,
        ])

        expect(document.body.innerHTML).toBe('<li>todo 1</li><li>todo 2</li><li>todo 3</li>')
    })
    
    it('should handle refs', () => {
        const node = new ReactiveNode(() => html`<p ref="text">sample</p>`, document.body)
        
        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)
        expect(node.refs).toEqual({text: [expect.any(HTMLParagraphElement)]})
    })
})
