import '../test.common'
import { ReactiveNode } from './ReactiveNode'
import { html, HtmlTemplate } from './html'
import { state } from './state'
import { is, when, repeat } from './helpers'

describe('ReactiveNode', () => {
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
        jest.advanceTimersToNextTimer()

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
        jest.advanceTimersToNextTimer()

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
        jest.advanceTimersToNextTimer()

        expect(document.body.innerHTML).toBe('<p>diff</p>')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)

        updateValue(true)
        jest.advanceTimersToNextTimer()

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
        jest.advanceTimersToNextTimer()
        expect(document.body.innerHTML).toBe('x won\n' +
            '                <button type="button">reset</button>')

        setCurrentPlayer('xy')
        jest.advanceTimersToNextTimer()
        expect(document.body.innerHTML).toBe('tie\n' +
            '                <button type="button">reset</button>')

        setEnded(false)
        jest.advanceTimersToNextTimer()
        expect(document.body.innerHTML).toBe('')

        setCurrentPlayer('x')
        jest.advanceTimersToNextTimer()
        expect(document.body.innerHTML).toBe('')

        setEnded(true)
        jest.advanceTimersToNextTimer()
        expect(document.body.innerHTML).toBe('x won\n' +
            '                <button type="button">reset</button>')

        setCurrentPlayer('x')
        setEnded(false)
        jest.advanceTimersToNextTimer()
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
        jest.advanceTimersToNextTimer()

        expect(document.body.innerHTML).toBe('<li>todo 1</li>')

        updateTodos([
            html`<li>todo 2</li>`,
            ...todos(),
            html`<li>todo 3</li>`,
        ])
        jest.advanceTimersToNextTimer()

        expect(document.body.innerHTML).toBe('<li>todo 2</li><li>todo 1</li><li>todo 3</li>')

        updateTodos([
            todos()[2],
            todos()[0],
            todos()[1],
        ])
        jest.advanceTimersToNextTimer()

        expect(document.body.innerHTML).toBe('<li>todo 3</li><li>todo 2</li><li>todo 1</li>')

        updateTodos([
            todos()[0],
            todos()[2],
        ])
        jest.advanceTimersToNextTimer()

        expect(document.body.innerHTML).toBe('<li>todo 3</li><li>todo 1</li>')

        updateTodos([
            todos()[1],
        ])
        jest.advanceTimersToNextTimer()

        expect(document.body.innerHTML).toBe('<li>todo 1</li>')

        updateTodos([])
        jest.advanceTimersToNextTimer()

        expect(document.body.innerHTML).toBe('')
        
        updateTodos([
            html`<li>todo 1</li>`,
            html`<li>todo 2</li>`,
            html`<li>todo 3</li>`,
        ])
        jest.advanceTimersToNextTimer()

        expect(document.body.innerHTML).toBe('<li>todo 1</li><li>todo 2</li><li>todo 3</li>')
    })
    
    it('should handle refs', () => {
        const node = new ReactiveNode(() => html`<p ref="text">sample</p>`, document.body)
        
        expect(document.body.innerHTML).toBe('<p>sample</p>')
        expect(node.parentNode).toBe(document.body)
        expect(document.body.childNodes).toHaveLength(4)
        expect(node.refs).toEqual({text: [expect.any(HTMLParagraphElement)]})
    })
    
    it('should swap second and before last items', () => {
        const unmountMock = jest.fn();
        const mountMock = jest.fn(() => unmountMock);
        const moveMock = jest.fn();
        const [list, updateList] = state(Array.from({ length: 10 }, (_, i) => i + 1));
        
        new ReactiveNode(repeat(list, (n) => html`<li>item ${n}</li>`.onMount(mountMock).onMove(moveMock)), document.body)
        
        expect(mountMock).toHaveBeenCalledTimes(10)
        expect(document.body.innerHTML).toBe('<li>item 1</li>' +
            '<li>item 2</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '<li>item 9</li>' +
            '<li>item 10</li>')
        
        mountMock.mockClear()
        
        updateList([
            1,
            9,
            3,
            4,
            5,
            6,
            7,
            8,
            2,
            10
        ])
        jest.advanceTimersToNextTimer()

        expect(mountMock).toHaveBeenCalledTimes(0)
        expect(moveMock).toHaveBeenCalledTimes(2)
        expect(unmountMock).toHaveBeenCalledTimes(0)
        
        expect(document.body.innerHTML).toBe('<li>item 1</li>' +
            '<li>item 9</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '<li>item 2</li>' +
            '<li>item 10</li>')

    })
    
    it('should update every other node', () => {
        const unmountMock = jest.fn();
        const mountMock = jest.fn(() => unmountMock);
        const moveMock = jest.fn();
        const [list, updateList] = state(Array.from({ length: 10 }, (_, i) => i + 1));
        
        new ReactiveNode(repeat(list, (n) => html`<li>item ${n}</li>`.onMount(mountMock).onMove(moveMock)), document.body)
        
        expect(mountMock).toHaveBeenCalledTimes(10)
        expect(document.body.innerHTML).toBe('<li>item 1</li>' +
            '<li>item 2</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '<li>item 9</li>' +
            '<li>item 10</li>')
        
        mountMock.mockClear()
        
        updateList([
            100,
            2,
            300,
            4,
            500,
            6,
            700,
            8,
            900,
            10
        ])
        jest.advanceTimersToNextTimer()
        
        expect(mountMock).toHaveBeenCalledTimes(5)
        expect(moveMock).toHaveBeenCalledTimes(0)
        expect(unmountMock).toHaveBeenCalledTimes(5)
        
        expect(document.body.innerHTML).toBe('<li>item 100</li>' +
            '<li>item 2</li>' +
            '<li>item 300</li>' +
            '<li>item 4</li>' +
            '<li>item 500</li>' +
            '<li>item 6</li>' +
            '<li>item 700</li>' +
            '<li>item 8</li>' +
            '<li>item 900</li>' +
            '<li>item 10</li>')
    })
})
