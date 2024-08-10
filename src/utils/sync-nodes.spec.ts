import '../../test.common';
import { syncNodes } from './sync-nodes'
import { html, HtmlTemplate } from '../html'
import { DoubleLinkedList } from '../DoubleLinkedList'

describe('syncNodes', () => {
    const ul = document.createElement('ul')
    const moveMock = jest.fn();
    const unmountMock = jest.fn();
    const mountMock = jest.fn(() => unmountMock);
    let nodes: HTMLElement[] = []
    let nodeTemplates: HtmlTemplate[] = []
    const anchor = document.createTextNode('')
    
    beforeEach(() => {
        document.body.appendChild(anchor)
        ul.innerHTML = ''
        ul.appendChild(anchor)
        nodeTemplates = Array.from({ length: 10 }, (_, i) => {
            return html`<li>item ${i + 1}</li>`.onMount(mountMock).onMove(moveMock)
        })
        nodes = Array.from({ length: 10 }, (_, i) => {
            const li = document.createElement('li')
            li.textContent = `item ${i + 1}`
            
            return li
        })
    })

    it('should add all new items', () => {
        ul.innerHTML = ''
        ul.appendChild(anchor)

        syncNodes(new DoubleLinkedList(), nodes, anchor)

        expect(ul.children).toHaveLength(nodes.length)
        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 1</li>' +
            '<li>item 2</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '<li>item 9</li>' +
            '<li>item 10</li>' +
            '</ul>')
    })
    
    it('should add all new HTMLTemplates', () => {
        syncNodes(new DoubleLinkedList(), nodeTemplates, anchor)

        expect(ul.children).toHaveLength(nodes.length)
        expect(mountMock).toHaveBeenCalledTimes(nodes.length)
        expect(unmountMock).toHaveBeenCalledTimes(0)
        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 1</li>' +
            '<li>item 2</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '<li>item 9</li>' +
            '<li>item 10</li>' +
            '</ul>')
    })

    it('should add new items', () => {
        ul.innerHTML = ''
        ul.appendChild(nodes[0])

        const newNodes = [nodes[0], nodes[1]];
        syncNodes(DoubleLinkedList.fromArray([nodes[0]]), newNodes, anchor)

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 1</li>' +
            '<li>item 2</li>' +
            '</ul>')
    })

    it('should add new HTMLTemplates', () => {
        expect(ul.children).toHaveLength(0)
        nodeTemplates[0].render(ul)
        mountMock.mockClear()

        const newNodes = [nodeTemplates[0], nodeTemplates[1]]
        syncNodes(DoubleLinkedList.fromArray([nodeTemplates[0]]), newNodes, anchor)

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 1</li>' +
            '<li>item 2</li>' +
            '</ul>')
        expect(mountMock).toHaveBeenCalledTimes(1)
        expect(unmountMock).toHaveBeenCalledTimes(0)
    })

    it('should remove all new items', () => {
        ul.append(...nodes)
        expect(ul.children).toHaveLength(nodes.length)

        syncNodes(DoubleLinkedList.fromArray(Array.from(ul.children)), [], anchor)

        expect(ul.outerHTML).toBe('<ul></ul>')
    })

    it('should remove all new HTMLTemplates', () => {
        expect(ul.children).toHaveLength(0)
        nodeTemplates.forEach(temp => temp.render(ul))
        mountMock.mockClear()
        expect(ul.children).toHaveLength(nodeTemplates.length)

        syncNodes(DoubleLinkedList.fromArray(nodeTemplates), [], anchor)

        expect(ul.outerHTML).toBe('<ul></ul>')
        expect(mountMock).toHaveBeenCalledTimes(0)
        expect(unmountMock).toHaveBeenCalledTimes(nodeTemplates.length)
    })

    it('should remove all current and add all new items', () => {
        nodes.slice(0, 5).forEach((n) => ul.appendChild(n))

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5',
        ])

        const newNodes = nodes.slice(5)
        syncNodes(DoubleLinkedList.fromArray(Array.from(ul.children)), newNodes, anchor)

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])
        
    })

    it('should remove all current and add all new HTMLTemplates', () => {
        const rNodes = nodeTemplates.slice(0, 5)
        rNodes.forEach((n) => n.render(ul))
        mountMock.mockClear()

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5',
        ])

        const newNodes = nodeTemplates.slice(5)
        syncNodes(DoubleLinkedList.fromArray(rNodes), newNodes, anchor)

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])
        expect(mountMock).toHaveBeenCalledTimes(5)
        expect(unmountMock).toHaveBeenCalledTimes(5)
    })

    it('should remove items from the start', () => {
        ul.append(...nodes)
        expect(ul.children).toHaveLength(nodes.length)

        const newNodes = nodes.slice(2)
        syncNodes(DoubleLinkedList.fromArray(Array.from(ul.children)), newNodes, anchor)

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '<li>item 9</li>' +
            '<li>item 10</li>' +
            '</ul>')
    })

    it('should remove HTMLTemplates from the start', () => {
        nodeTemplates.forEach(temp => temp.render(ul))
        mountMock.mockClear()
        expect(ul.children).toHaveLength(nodeTemplates.length)
        expect(anchor.parentNode).toEqual(ul)

        const newNodes = nodeTemplates.slice(2);
        syncNodes(DoubleLinkedList.fromArray(nodeTemplates), newNodes, anchor)

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '<li>item 9</li>' +
            '<li>item 10</li>' +
            '</ul>')
        expect(mountMock).toHaveBeenCalledTimes(0)
        expect(moveMock).toHaveBeenCalledTimes(0)
        expect(unmountMock).toHaveBeenCalledTimes(2)
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

        const newNodes = [...startNodes, ...endNodes]
        syncNodes(
            DoubleLinkedList.fromArray(Array.from(ul.children)),
            newNodes,
            anchor
        )

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
        mountMock.mockClear()
        expect(ul.children).toHaveLength(nodeTemplates.length)
        const startNodes = nodeTemplates.slice(0, 3)
        const endNodes = nodeTemplates.slice(7)

        expect([...startNodes.flatMap(n => n.childNodes), ...endNodes.flatMap(n => n.childNodes)].map((n) => n.textContent)).toEqual([
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

        const newNodes = [...startNodes, ...endNodes]
        syncNodes(
            DoubleLinkedList.fromArray(nodeTemplates),
            newNodes,
            anchor
        )

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 1</li>' +
            '<li>item 2</li>' +
            '<li>item 3</li>' +
            '<li>item 8</li>' +
            '<li>item 9</li>' +
            '<li>item 10</li>' +
            '</ul>')
        expect(mountMock).toHaveBeenCalledTimes(0)
        expect(moveMock).toHaveBeenCalledTimes(0)
        expect(unmountMock).toHaveBeenCalledTimes(4) // 4 middle nodes unmounted
    })

    it('should remove items from the end', () => {
        ul.append(...nodes)
        expect(ul.children).toHaveLength(nodes.length)

        const newNodes = nodes.slice(0, -2)
        syncNodes(
            DoubleLinkedList.fromArray(Array.from(ul.children)),
            newNodes,
            anchor
        )

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 1</li>' +
            '<li>item 2</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '</ul>')
    })

    it('should remove HTMLTemplates from the end', () => {
        nodeTemplates.forEach(temp => temp.render(ul))
        mountMock.mockClear()
        expect(ul.children).toHaveLength(nodeTemplates.length)

        const newNodes = nodeTemplates.slice(0, -2)
        syncNodes(
            DoubleLinkedList.fromArray(nodeTemplates),
            newNodes,
            anchor
        )

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 1</li>' +
            '<li>item 2</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '</ul>')
        expect(mountMock).toHaveBeenCalledTimes(0)
        expect(unmountMock).toHaveBeenCalledTimes(2)
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

        syncNodes(DoubleLinkedList.fromArray(Array.from(ul.children)), reversedNodes, anchor)

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 10</li>' +
            '<li>item 9</li>' +
            '<li>item 8</li>' +
            '<li>item 7</li>' +
            '<li>item 6</li>' +
            '<li>item 5</li>' +
            '<li>item 4</li>' +
            '<li>item 3</li>' +
            '<li>item 2</li>' +
            '<li>item 1</li>' +
            '</ul>')
    })

    it('should reverse the HTMLTemplates', () => {
        nodeTemplates.forEach(temp => temp.render(ul))
        mountMock.mockClear()
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

        expect(reversedNodes.flatMap((t) => t.childNodes.map((n) => n.textContent))).toEqual([
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

        syncNodes(DoubleLinkedList.fromArray(nodeTemplates), reversedNodes, anchor)

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 10</li>' +
            '<li>item 9</li>' +
            '<li>item 8</li>' +
            '<li>item 7</li>' +
            '<li>item 6</li>' +
            '<li>item 5</li>' +
            '<li>item 4</li>' +
            '<li>item 3</li>' +
            '<li>item 2</li>' +
            '<li>item 1</li>' +
            '</ul>')
        expect(mountMock).toHaveBeenCalledTimes(0)
        expect(moveMock).toHaveBeenCalledTimes(9) // all but first node moved
        expect(unmountMock).toHaveBeenCalledTimes(0)
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

        syncNodes(DoubleLinkedList.fromArray(Array.from(ul.children)), shuffledNodes, anchor)

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 9</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 2</li>' +
            '<li>item 10</li>' +
            '<li>item 1</li>' +
            '<li>item 6</li>' +
            '</ul>')
    })

    it('should shuffle HTMLTemplates', () => {
        nodeTemplates.forEach(temp => temp.render(ul))
        mountMock.mockClear()
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

        expect(shuffledNodes.flatMap(t => t.childNodes.map((n) => n.textContent))).toEqual([
            'item 9',
            'item 3',
            'item 4',
            'item 2',
            'item 10',
            'item 1',
            'item 6',
        ])

        syncNodes(DoubleLinkedList.fromArray(nodeTemplates), shuffledNodes, anchor)

        expect(ul.outerHTML).toBe('<ul>' +
            '<li>item 9</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 2</li>' +
            '<li>item 10</li>' +
            '<li>item 1</li>' +
            '<li>item 6</li>' +
            '</ul>')
        expect(mountMock).toHaveBeenCalledTimes(0)
        expect(moveMock).toHaveBeenCalledTimes(5)
        expect(unmountMock).toHaveBeenCalledTimes(3) // 3 nodes not in the shuffled list removed
    })

    it('should handle filtering items out', () => {
        const complete = document.createElement('complete')
        const edit = document.createElement('edit')
        const archive = document.createElement('archive')

        syncNodes(new DoubleLinkedList(), [complete, edit, archive], anchor)

        expect(ul.innerHTML).toBe(
            '<complete></complete><edit></edit><archive></archive>'
        )

        syncNodes(DoubleLinkedList.fromArray([complete, edit, archive]), [archive], anchor)

        expect(ul.innerHTML).toBe('<archive></archive>')
    })

    it('should handle filtering HTMLTemplates out', () => {
        const complete = html`<complete></complete>`.onMount(mountMock)
        const edit = html`<edit></edit>`.onMount(mountMock)
        const archive = html`<archive></archive>`.onMount(mountMock)

        syncNodes(new DoubleLinkedList(), [complete, edit, archive], anchor)
        expect(mountMock).toHaveBeenCalledTimes(3)
        expect(unmountMock).toHaveBeenCalledTimes(0)
        mountMock.mockClear()

        expect(ul.innerHTML).toBe(
            '<complete></complete><edit></edit><archive></archive>'
        )

        syncNodes(DoubleLinkedList.fromArray([complete, edit, archive]), [archive], anchor)

        expect(ul.innerHTML).toBe('<archive></archive>')
        expect(mountMock).toHaveBeenCalledTimes(0)
        expect(moveMock).toHaveBeenCalledTimes(0)
        expect(unmountMock).toHaveBeenCalledTimes(2)
    })

    it('should handle first item moved with end anchor', () => {
        const parent = document.createElement('div');
        parent.appendChild(anchor)
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

        syncNodes(DoubleLinkedList.fromArray([span1, span2]), [span3, span2, span1], anchor);

        expect(parent.children).toHaveLength(4)
        expect(parent.children[0]).toEqual(span3)
        expect(parent.children[1]).toEqual(span2)
        expect(parent.children[2]).toEqual(span1)
        expect(parent.children[3]).toEqual(span4)
    })

    it('should handle first HTMLTemplate moved with end anchor', () => {
        const parent = document.createElement('div');
        parent.appendChild(anchor)
        const span1 = html`<span></span>`.onMount(mountMock);
        const span2 = html`<span></span>`.onMount(mountMock);
        const span3 = html`<span></span>`.onMount(mountMock);
        const span4 = html`<span></span>`.onMount(mountMock);
        span1.render(parent)
        span2.render(parent)
        span4.render(parent)
        mountMock.mockClear()

        expect(parent.children).toHaveLength(3)
        expect(parent.children[0]).toEqual(span1.childNodes[0])
        expect(parent.children[1]).toEqual(span2.childNodes[0])
        expect(parent.children[2]).toEqual(span4.childNodes[0])

        syncNodes(DoubleLinkedList.fromArray([span1, span2]), [span3, span2, span1], anchor);

        expect(parent.children).toHaveLength(4)
        expect(parent.children[0]).toEqual(span3.childNodes[0])
        expect(parent.children[1]).toEqual(span2.childNodes[0])
        expect(parent.children[2]).toEqual(span1.childNodes[0])
        expect(parent.children[3]).toEqual(span4.childNodes[0])

        expect(mountMock).toHaveBeenCalledTimes(1)
        expect(moveMock).toHaveBeenCalledTimes(0)
        expect(unmountMock).toHaveBeenCalledTimes(0)
    })

    it('should swap second and before last items', () => {
        expect(ul.children).toHaveLength(0)

        syncNodes(new DoubleLinkedList(), nodeTemplates, anchor)

        expect(ul.children).toHaveLength(nodeTemplates.length)
        expect(mountMock).toHaveBeenCalledTimes(10)

        mountMock.mockClear()

        expect(ul.innerHTML).toBe(
            '<li>item 1</li>' +
            '<li>item 2</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '<li>item 9</li>' +
            '<li>item 10</li>')

        syncNodes(DoubleLinkedList.fromArray(nodeTemplates), [
            nodeTemplates[0],
            nodeTemplates[8],
            nodeTemplates[2],
            nodeTemplates[3],
            nodeTemplates[4],
            nodeTemplates[5],
            nodeTemplates[6],
            nodeTemplates[7],
            nodeTemplates[1],
            nodeTemplates[9],
        ], anchor)

        expect(ul.innerHTML).toBe(
            '<li>item 1</li>' +
            '<li>item 9</li>' +
            '<li>item 3</li>' +
            '<li>item 4</li>' +
            '<li>item 5</li>' +
            '<li>item 6</li>' +
            '<li>item 7</li>' +
            '<li>item 8</li>' +
            '<li>item 2</li>' +
            '<li>item 10</li>')
        expect(mountMock).toHaveBeenCalledTimes(0)
        expect(moveMock).toHaveBeenCalledTimes(2)
        expect(unmountMock).toHaveBeenCalledTimes(0)
    })
})