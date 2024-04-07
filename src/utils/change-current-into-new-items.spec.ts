import { changeCurrentIntoNewItems } from './change-current-into-new-items'

describe('changeCurrentIntoNewItems', () => {
    const ul = document.createElement('ul')

    const nodes = Array.from({ length: 10 }, (_, i) => {
        const li = document.createElement('li')
        li.textContent = `item ${i + 1}`

        return li
    })
    
    beforeEach(() => {
        ul.innerHTML = ''
        ul.append(...nodes)
    })

    it('should add all new items', () => {
        ul.innerHTML = ''

        changeCurrentIntoNewItems([], nodes, ul)

        expect(ul.children).toHaveLength(nodes.length)
    })

    it('should add new items', () => {
        ul.innerHTML = ''
        ul.appendChild(nodes[0])

        changeCurrentIntoNewItems([nodes[0]], [nodes[0], nodes[1]], ul)

        expect(ul.children).toHaveLength(2)
    })

    it('should remove all new items', () => {
        expect(ul.children).toHaveLength(nodes.length)

        changeCurrentIntoNewItems(Array.from(ul.children), [], ul)

        expect(ul.children).toHaveLength(0)
    })

    it('should remove all current and add all new items', () => {
        ul.innerHTML = ''
        nodes.slice(0, 4).forEach((n) => ul.appendChild(n))

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 1',
            'item 2',
            'item 3',
            'item 4',
        ])

        changeCurrentIntoNewItems(Array.from(ul.children), nodes.slice(5), ul)

        expect(Array.from(ul.children, (n) => n.textContent)).toEqual([
            'item 6',
            'item 7',
            'item 8',
            'item 9',
            'item 10',
        ])
    })

    it('should remove items from the start', () => {
        expect(ul.children).toHaveLength(nodes.length)

        changeCurrentIntoNewItems(Array.from(ul.children), nodes.slice(2), ul)

        expect(ul.children).toHaveLength(8)
        expect(ul.children[0].textContent).toBe('item 3')
    })

    it('should remove items from the middle', () => {
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

        changeCurrentIntoNewItems(
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

    it('should remove items from the end', () => {
        expect(ul.children).toHaveLength(nodes.length)

        changeCurrentIntoNewItems(
            Array.from(ul.children),
            nodes.slice(0, -2),
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

        changeCurrentIntoNewItems(Array.from(ul.children), reversedNodes, ul)

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

        changeCurrentIntoNewItems(Array.from(ul.children), shuffledNodes, ul)

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
        ul.innerHTML = ''
        const complete = document.createElement('complete')
        const edit = document.createElement('edit')
        const archive = document.createElement('archive')

        changeCurrentIntoNewItems([], [complete, edit, archive], ul)

        expect(ul.innerHTML).toBe(
            '<complete></complete><edit></edit><archive></archive>'
        )

        changeCurrentIntoNewItems([complete, edit, archive], [archive], ul)

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
        
        changeCurrentIntoNewItems([span1, span2], [span3, span2, span1], parent);
        
        expect(parent.children).toHaveLength(4)
        expect(parent.children[0]).toEqual(span3)
        expect(parent.children[1]).toEqual(span2)
        expect(parent.children[2]).toEqual(span1)
        expect(parent.children[3]).toEqual(span4)
    })
})
