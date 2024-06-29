import { ReactiveNode } from './ReactiveNode'
import { html, HtmlTemplate } from './html'
import { state } from './state'
import { is, when } from './helpers'

describe('ReactiveNode', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })
    
    it('should render text', () => {
        const node = new ReactiveNode('sample', []).render(document.body)
        
        expect(document.body.innerHTML).toBe('sample')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
    })
    
    it('should render primitive values', () => {
        const node = new ReactiveNode('$val0 is $val1 $val2', [12, true, 'value']).render(document.body)
        
        expect(document.body.innerHTML).toBe('12 is true value')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
    })
    
    it('should handle removing', () => {
        const node = new ReactiveNode('sample', []).render(document.body)
        
        expect(document.body.innerHTML).toBe('sample')
        expect(document.body.childNodes).toHaveLength(1)
        expect(node.isConnected).toBeTruthy()
        
        node.unmount()
        
        expect(document.body.innerHTML).toBe('')
        expect(document.body.childNodes).toHaveLength(0)
        expect(node.isConnected).toBeFalsy()
    })
    
    it('should render template', () => {
        const node = new ReactiveNode('$val0', [html`<p>sample</p>`]).render(document.body)
        
        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
    })
    
    it('should render array', () => {
        const node = new ReactiveNode('$val0', [[html`<p>sample</p>`, true]]).render(document.body)
        
        expect(document.body.innerHTML).toBe('<p>sample</p>true')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(2)
    })
    
    it('should render function', () => {
        const node = new ReactiveNode('$val0', [() => html`<p>sample</p>`]).render(document.body)
        
        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
    })
    
    it('should render state', () => {
        const [value, updateValue] = state('sample')
        const node = new ReactiveNode('$val0', [value]).render(document.body)
        
        expect(document.body.innerHTML).toBe('sample')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
        
        updateValue('new value')
        
        expect(document.body.innerHTML).toBe('new value')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
    })
    
    it('should render template with state', () => {
        const [value, updateValue] = state('sample')
        const node = new ReactiveNode('$val0', [html`<p>${value}</p>`]).render(document.body)
        
        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
        
        updateValue('new value')
        
        expect(document.body.innerHTML).toBe('<p>new value</p>')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
    })
    
    it('should render conditional content', () => {
        const [value, updateValue] = state(true)
        const node = new ReactiveNode('$val0', [() => {
            if (value()) {
                return html`<p>sample</p>`
            }
            
            return html`<p>diff</p>`
        }]).render(document.body)
        
        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
        
        updateValue(false)
        
        expect(document.body.innerHTML).toBe('<p>diff</p>')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
        
        updateValue(true)
        
        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(1)
    })
    
    it('should render nested conditional content', () => {
        const [currentPlayer, setCurrentPlayer] = state('x')
        const [ended, setEnded] = state(false)
        
        new ReactiveNode('$val0', [html`
            ${when(ended, html`
                ${when(is(currentPlayer, 'xy'),
                    html`tie`,
                    html`${currentPlayer} won`,
                )}
                <button type="button">reset</button>
            `)}
        `]).render(document.body)
        
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
        const node = new ReactiveNode('$val0', [todos]).render(document.body)
        
        expect(document.body.innerHTML).toBe('')
        expect(node.isConnected).toBeTruthy()
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(0)
        
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
})
