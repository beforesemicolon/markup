import { html } from '../html'
import { state } from '../state'
import { is, when } from '../helpers'
import { ContentDynamicValueResolver } from './ContentDynamicValueResolver'

describe('ContentDynamicValueResolver', () => {
    beforeEach(() => {
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            const id = Math.random()
            cb(id);
            return id;
        });
    })
    
    afterEach(() => {
        (window.requestAnimationFrame as jest.Mock)?.mockRestore?.();
    })
    
    const renderContent = (value: any, data = null, renderedNodes = [document.createTextNode('$val0')]) => {
        const refs = {}
        document.body.innerHTML = '';
        document.body.append(...renderedNodes)
        
        const dynamicValue = new ContentDynamicValueResolver(
            'nodeValue',
            '$val0',
            value,
            renderedNodes
        )
        dynamicValue.data = data;
        
        dynamicValue.resolve(refs)
        
        return {
            dynamicValue,
            refs,
            update: () => {
                dynamicValue.resolve(refs);
            }
        };
    }
    
    it('should render and update a dynamic text', () => {
        let txt  = 'sample';
        const {dynamicValue, update} = renderContent(() => txt)
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('sample');
        expect(dynamicValue.data).toBe('sample');
        expect(document.body.innerHTML).toBe('sample')
        
        txt = 'changed';
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('changed');
        expect(dynamicValue.data).toBe('changed');
        expect(document.body.innerHTML).toBe('changed')
    })
    
    it('should render and update a list of dynamic text', () => {
        let list = [() => 'one', () => 'two', () => 'three'];
        const {dynamicValue, update} = renderContent(list)
        
        expect(dynamicValue.renderedNodes).toHaveLength(3);
        expect(dynamicValue.renderedNodes.every(node => node instanceof Text)).toBe(true);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('one');
        expect(dynamicValue.renderedNodes[1].nodeValue).toBe('two');
        expect(dynamicValue.renderedNodes[2].nodeValue).toBe('three');
        expect(document.body.innerHTML).toBe('onetwothree')
        
        list.pop()

        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes.every(node => node instanceof Text)).toBe(true);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('one');
        expect(dynamicValue.renderedNodes[1].nodeValue).toBe('two');
        expect(document.body.innerHTML).toBe('onetwo')
    })
    
    it('should render and update a dynamic conditional template', () => {
        let x = 15
        const a = html`<p>more than 10</p>`
        const b = html`<p>less than 10</p>`
        const {dynamicValue, update} = renderContent(
            () => x > 10 ? html`>${a}` : html`<${b}`
        )
        
        expect(a.nodes).toHaveLength(1);
        expect(a.mounted).toBeTruthy();
        expect(b.nodes).toHaveLength(0);
        expect(b.mounted).toBeFalsy();
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('>');
        expect((dynamicValue.renderedNodes[1] as Element).outerHTML).toBe('<p>more than 10</p>');
        expect(document.body.innerHTML).toBe('&gt;<p>more than 10</p>')
        
        x = 5;
        
        update();
        
        expect(a.nodes).toHaveLength(0);
        expect(a.mounted).toBeFalsy();
        expect(b.nodes).toHaveLength(1);
        expect(b.mounted).toBeTruthy();
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('<');
        expect((dynamicValue.renderedNodes[1] as Element).outerHTML).toBe('<p>less than 10</p>');
        expect(document.body.innerHTML).toBe('&lt;<p>less than 10</p>')
    })
    
    it('should render and update a template', () => {
        let txt  = 'sample';
        const temp = html`${() => txt}`;
        const {dynamicValue, update} = renderContent(temp)
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('sample');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('sample')
        
        txt = 'changed';
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('changed');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('changed')
    })
    
    it('should render and update nested templates', () => {
        let txt  = 'sample';
        const temp = html`${html`${() => txt}`}`;
        const {dynamicValue, update} = renderContent(temp)
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('sample');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('sample')
        
        txt = 'changed';
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('changed');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('changed')
    })
    
    it('should render and update deeply nested templates', () => {
        let txt  = 'sample';
        const temp = html`${html`${html`${html`${() => txt}`}`}`}`;
        const {dynamicValue, update} = renderContent(temp)
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('sample');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('sample')
        
        txt = 'changed';
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('changed');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('changed')
    })
    
    it('should render and update when helper with templates', () => {
        let condition  = true;
        const temp = html`${when(() => condition, 'truthy', 'falsy')}`;
        const {dynamicValue, update} = renderContent(temp)
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('truthy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('truthy')
        
        condition = false;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('falsy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('falsy')
        
        condition = true;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('truthy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('truthy')
    })
    
    it('should render and update nested when helper with templates', () => {
        let condition1  = true;
        let condition2  = true;
        const temp = html`${
            when(() => condition1,
              html`${
                when(() => condition2,
                  'deep-truthy',
                  'deep-falsy'
                )}<span>after</span>`
              ,
              'falsy')
        }`;
        const {dynamicValue, update} = renderContent(temp)
        
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('deep-truthy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('deep-truthy<span>after</span>')
        
        condition1 = false;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('falsy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('falsy')
        
        condition1 = true;
        condition2  = false;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('deep-falsy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('deep-falsy<span>after</span>')
        
        condition1 = false;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('falsy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('falsy')
        
        condition1 = true;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('deep-falsy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('deep-falsy<span>after</span>')
    })
    
    it('should render and update deeply nested when helper with templates', () => {
        let condition1  = true;
        let condition2  = true;
        let condition3  = true;
        const temp = html`${
          when(() => condition1,
            html`${
              when(() => condition2,
                'deep-truthy',
                'deep-falsy'
              )}<span>${when(() => condition3,
                'after-truthy',
                'after-falsy'
                )}</span>`
            ,
            'falsy')
        }`;
        const {dynamicValue, update} = renderContent(temp)
        
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('deep-truthy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('deep-truthy<span>after-truthy</span>')
        
        condition3  = false;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('deep-truthy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('deep-truthy<span>after-falsy</span>')
        
        condition2  = false;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('deep-falsy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('deep-falsy<span>after-falsy</span>')
        
        condition1 = false;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('falsy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('falsy')
        
        condition1 = true;
        condition3 = true;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('deep-falsy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('deep-falsy<span>after-truthy</span>')
        
        condition2  = true;
        
        update()
        
        expect(dynamicValue.renderedNodes).toHaveLength(2);
        expect(dynamicValue.renderedNodes[0]).toBeInstanceOf(Text);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('deep-truthy');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('deep-truthy<span>after-truthy</span>')
    })
    
    it("should render nested 'when' helper with 'is' helper for condition and 'state' for data update",  () => {
        const [currentPlayer, setCurrentPlayer] = state("x")
        const [ended, setEnded] = state(false);
        
        const temp = html`${when(ended, html`
            ${when(is(currentPlayer, 'xy'),
              html`tie`,
              html`${currentPlayer} won`
            )}<button type="button">reset</button>
        `)}`;
        const {dynamicValue, update} = renderContent(temp)
        
        expect(dynamicValue.renderedNodes).toHaveLength(1);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('')
        
        setEnded(true)

        expect(document.body.innerHTML).toBe('x won<button type="button">reset</button>')
        
        setCurrentPlayer('xy')

        expect(document.body.innerHTML).toBe('tie<button type="button">reset</button>')
        
        setEnded(false)

        expect(document.body.innerHTML).toBe('')
        
        setCurrentPlayer('x')
       
        expect(document.body.innerHTML).toBe('')
        
        setEnded(true)
        
        expect(dynamicValue.renderedNodes).toHaveLength(3);
        expect(dynamicValue.renderedNodes[0].nodeValue).toBe('x');
        expect(dynamicValue.renderedNodes[1].nodeValue).toBe(' won');
        expect((dynamicValue.renderedNodes[2] as Element).outerHTML).toBe('<button type="button">reset</button>');
        expect(dynamicValue.data).toBe(temp);
        expect(document.body.innerHTML).toBe('x won<button type="button">reset</button>')
    });
    
    // todo: html.spec.ts has these tests but moving them here makes it easier to debug
    it.todo('should render and update array')
    it.todo('should render and update nodes')
    it.todo('should render and update repeat helper with primitives')
    it.todo('should render and update nested repeat helper with primitives')
    it.todo('should render and update deeply nested repeat helper with primitives')
    it.todo('should render and update repeat helper with objects')
    it.todo('should render and update nested repeat helper with objects')
    it.todo('should render and update deeply nested repeat helper with objects')
    it.todo('should render and update repeat helper with templates')
    it.todo('should render and update nested repeat helper with templates')
    it.todo('should render and update deeply nested repeat helper with templates')
})
