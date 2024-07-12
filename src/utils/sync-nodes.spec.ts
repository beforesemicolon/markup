import { syncNodes } from './sync-nodes'
import { html, HtmlTemplate } from '../html'

describe('syncNodes', () => {
    const ul = document.createElement('ul')

    let nodes: HTMLElement[] = []
    let nodeTemplates: HtmlTemplate[] = []
    
    beforeEach(() => {
        ul.innerHTML = ''
        nodeTemplates = Array.from({ length: 10 }, (_, i) => {
            return html`<li>item ${i + 1}</li>`
        })
        nodes = Array.from({ length: 10 }, (_, i) => {
            const li = document.createElement('li')
            li.textContent = `item ${i + 1}`
            
            return li
        })
    })

    it('should add all new items', () => {
        ul.append(...nodes)
        ul.innerHTML = ''

        syncNodes([], nodes, ul)

        expect(ul.children).toHaveLength(nodes.length)
    })
    
    it('should add all new HTMLTemplates', () => {
        syncNodes([], nodeTemplates, ul)
        
        expect(ul.children).toHaveLength(nodes.length)
    })

    it('should add new items', () => {
        ul.append(...nodes)
        ul.innerHTML = ''
        ul.appendChild(nodes[0])

        syncNodes([nodes[0]], [nodes[0], nodes[1]], ul)

        expect(ul.children).toHaveLength(2)
    })
    
    it('should add new HTMLTemplates', () => {
        expect(ul.children).toHaveLength(0)
        nodeTemplates[0].render(ul)
        
        syncNodes([nodeTemplates[0]], [nodeTemplates[0], nodeTemplates[1]], ul)
        
        expect(ul.children).toHaveLength(2)
    })

    it('should remove all new items', () => {
        ul.append(...nodes)
        expect(ul.children).toHaveLength(nodes.length)

        syncNodes(Array.from(ul.children), [], ul)

        expect(ul.children).toHaveLength(0)
    })
    
    it('should remove all new HTMLTemplates', () => {
        expect(ul.children).toHaveLength(0)
        nodeTemplates.forEach(temp => temp.render(ul))
        expect(ul.children).toHaveLength(nodeTemplates.length)
        
        syncNodes(Array.from(ul.children), [], ul)
        
        expect(ul.children).toHaveLength(0)
    })

    it('should remove all current and add all new items', () => {
        nodes.slice(0, 4).forEach((n) => ul.appendChild(n))

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
        ])

        syncNodes(Array.from(ul.children), nodes.slice(5), ul)

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])
    })
    
    it('should remove all current and add all new HTMLTemplates', () => {
        nodeTemplates.slice(0, 4).forEach((n) => n.render(ul))
        
        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
        ])
        
        syncNodes(Array.from(ul.children), nodeTemplates.slice(5), ul)
        
        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])
    })

    it('should remove items from the start', () => {
        ul.append(...nodes)
        expect(ul.children).toHaveLength(nodes.length)

        syncNodes(Array.from(ul.children), nodes.slice(2), ul)

        expect(ul.children).toHaveLength(8)
        expect(ul.children[0].textContent).toBe('item 3')
    })
    
    it('should remove HTMLTemplates from the start', () => {
        nodeTemplates.forEach(temp => temp.render(ul))
        expect(ul.children).toHaveLength(nodeTemplates.length)
        
        syncNodes(nodeTemplates, nodeTemplates.slice(2), ul)
        
        expect(ul.children).toHaveLength(8)
        expect(ul.children[0].textContent).toBe('item 3')
    })

    it('should remove items from the middle', () => {
        ul.append(...nodes)
        expect(ul.children).toHaveLength(nodes.length)
        const startNodes = nodes.slice(0, 3)
        const endNodes = nodes.slice(7)

        expect([...startNodes, ...endNodes].map((n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 8',
            'item 9',
            'item 10',
        ])
        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5',
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])

        syncNodes(
            Array.from(ul.children),
            [...startNodes, ...endNodes],
            ul
        )

        expect(ul.children).toHaveLength(6)
        expect(ul.children[0].textContent).toBe('item 1')
        expect(ul.children[ul.children.length - 1].textContent).toBe('item 10')
        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 8',
            'item 9',
            'item 10',
        ])
    })
    
    it('should remove HTMLTemplates from the middle', () => {
        nodeTemplates.forEach(temp => temp.render(ul))
        expect(ul.children).toHaveLength(nodeTemplates.length)
        const startNodes = nodeTemplates.slice(0, 3)
        const endNodes = nodeTemplates.slice(7)
        
        expect([...startNodes.flatMap(n => n.nodes), ...endNodes.flatMap(n => n.nodes)].map((n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 8',
            'item 9',
            'item 10',
        ])
        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5',
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])
        
        syncNodes(
            nodeTemplates,
            [...startNodes, ...endNodes],
            ul
        )
        
        expect(ul.children).toHaveLength(6)
        expect(ul.children[0].textContent).toBe('item 1')
        expect(ul.children[ul.children.length - 1].textContent).toBe('item 10')
        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 8',
            'item 9',
            'item 10',
        ])
    })

    it('should remove items from the end', () => {
        ul.append(...nodes)
        expect(ul.children).toHaveLength(nodes.length)

        syncNodes(
            Array.from(ul.children),
            nodes.slice(0, -2),
            ul
        )

        expect(ul.children).toHaveLength(8)
        expect(ul.children[0].textContent).toBe('item 1')
        expect(ul.children[ul.children.length - 1].textContent).toBe('item 8')
    })
    
    it('should remove HTMLTemplates from the end', () => {
        nodeTemplates.forEach(temp => temp.render(ul))
        expect(ul.children).toHaveLength(nodeTemplates.length)
        
        syncNodes(
            nodeTemplates,
            nodeTemplates.slice(0, -2),
            ul
        )
        
        expect(ul.children).toHaveLength(8)
        expect(ul.children[0].textContent).toBe('item 1')
        expect(ul.children[ul.children.length - 1].textContent).toBe('item 8')
    })

    it('should reverse the items', () => {
        nodes.forEach((n) => ul.appendChild(n))

        const reversedNodes: Node[] = []

        nodes.forEach((n, i, list) => {
            reversedNodes.unshift(n)
        })

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5',
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])

        expect(reversedNodes.map((n) => n.textContent)).toEqual([
            'item 10',
            'item 9',
            'item 8',
            'item 7',
            'item 6',
            'item 5',
            'item 4',
            'item 3',
            'item 2',
            'item 1',
        ])

        syncNodes(Array.from(ul.children), reversedNodes, ul)

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 10',
            'item 9',
            'item 8',
            'item 7',
            'item 6',
            'item 5',
            'item 4',
            'item 3',
            'item 2',
            'item 1',
        ])
    })
    
    it('should reverse the HTMLTemplates', () => {
        nodeTemplates.forEach(temp => temp.render(ul))
        
        const reversedNodes: HtmlTemplate[] = []
        
        nodeTemplates.forEach((n, i, list) => {
            reversedNodes.unshift(n)
        })
        
        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5',
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])
        
        expect(reversedNodes.flatMap((t) => t.nodes.map((n) => n.textContent))).toEqual([
            'item 10',
            'item 9',
            'item 8',
            'item 7',
            'item 6',
            'item 5',
            'item 4',
            'item 3',
            'item 2',
            'item 1',
        ])
        
        syncNodes(nodeTemplates, reversedNodes, ul)
        
        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 10',
            'item 9',
            'item 8',
            'item 7',
            'item 6',
            'item 5',
            'item 4',
            'item 3',
            'item 2',
            'item 1',
        ])
    })

    it('should shuffle items', () => {
        ul.append(...nodes)
        const shuffledNodes = [
            nodes[8],
            nodes[2],
            nodes[3],
            nodes[1],
            nodes[9],
            nodes[0],
            nodes[5],
        ]

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5',
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])

        expect(shuffledNodes.map((n) => n.textContent)).toEqual([
            'item 9',
            'item 3',
            'item 4',
            'item 2',
            'item 10',
            'item 1',
            'item 6',
        ])

        syncNodes(Array.from(ul.children), shuffledNodes, ul)

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 9',
            'item 3',
            'item 4',
            'item 2',
            'item 10',
            'item 1',
            'item 6',
        ])
    })
    
    it('should shuffle HTMLTemplates', () => {
        nodeTemplates.forEach(temp => temp.render(ul))
        const shuffledNodes = [
            nodeTemplates[8],
            nodeTemplates[2],
            nodeTemplates[3],
            nodeTemplates[1],
            nodeTemplates[9],
            nodeTemplates[0],
            nodeTemplates[5],
        ]

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5',
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])

        expect(shuffledNodes.flatMap(t => t.nodes.map((n) => n.textContent))).toEqual([
            'item 9',
            'item 3',
            'item 4',
            'item 2',
            'item 10',
            'item 1',
            'item 6',
        ])

        syncNodes(nodeTemplates, shuffledNodes, ul)

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 9',
            'item 3',
            'item 4',
            'item 2',
            'item 10',
            'item 1',
            'item 6',
        ])
    })

    it('should handle filtering items out', () => {
        const complete = document.createElement('complete')
        const edit = document.createElement('edit')
        const archive = document.createElement('archive')

        syncNodes([], [complete, edit, archive], ul)

        expect(ul.innerHTML).toBe(
            '<complete></complete><edit></edit><archive></archive>'
        )

        syncNodes([complete, edit, archive], [archive], ul)

        expect(ul.innerHTML).toBe('<archive></archive>')
    })
    
    it('should handle filtering HTMLTemplates out', () => {
        const complete = html`<complete></complete>`
        const edit = html`<edit></edit>`
        const archive = html`<archive></archive>`
        
        syncNodes([], [complete, edit, archive], ul)
        
        expect(ul.innerHTML).toBe(
            '<complete></complete><edit></edit><archive></archive>'
        )
        
        syncNodes([complete, edit, archive], [archive], ul)
        
        expect(ul.innerHTML).toBe('<archive></archive>')
    })
    
    it('should handle first item moved with end anchor', () => {
        const parent = document.createElement('div');
        const span1 = document.createElement('span');
        const span2 = document.createElement('span');
        const span3 = document.createElement('span');
        const span4 = document.createElement('span');
        parent.appendChild(span1)
        parent.appendChild(span2)
        parent.appendChild(span4)
        
        expect(parent.children).toHaveLength(3)
        expect(parent.children[0]).toEqual(span1)
        expect(parent.children[1]).toEqual(span2)
        expect(parent.children[2]).toEqual(span4)
        
        syncNodes([span1, span2], [span3, span2, span1], parent);
        
        expect(parent.children).toHaveLength(4)
        expect(parent.children[0]).toEqual(span3)
        expect(parent.children[1]).toEqual(span2)
        expect(parent.children[2]).toEqual(span1)
        expect(parent.children[3]).toEqual(span4)
    })
    
    it('should handle first HTMLTemplate moved with end anchor', () => {
        const parent = document.createElement('div');
        const span1 = html`<span></span>`;
        const span2 = html`<span></span>`;
        const span3 = html`<span></span>`;
        const span4 = html`<span></span>`;
        span1.render(parent)
        span2.render(parent)
        span4.render(parent)
        
        expect(parent.children).toHaveLength(3)
        expect(parent.children[0]).toEqual(span1.nodes[0])
        expect(parent.children[1]).toEqual(span2.nodes[0])
        expect(parent.children[2]).toEqual(span4.nodes[0])
        
        syncNodes([span1, span2], [span3, span2, span1], parent);
        
        expect(parent.children).toHaveLength(4)
        expect(parent.children[0]).toEqual(span3.nodes[0])
        expect(parent.children[1]).toEqual(span2.nodes[0])
        expect(parent.children[2]).toEqual(span1.nodes[0])
        expect(parent.children[3]).toEqual(span4.nodes[0])
    })
})