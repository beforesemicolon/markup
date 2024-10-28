import { DoubleLinkedList } from './DoubleLinkedList.ts'

describe('DoubleLinkedList', () => {
    it('should push, remove, and clear values correctly', () => {
        let ll= new DoubleLinkedList();
        
        ll.push(1);
        ll.push(2);
        ll.push(3);
        
        expect([...ll]).toEqual([1, 2, 3])
        expect(ll.head).toBe(1)
        expect(ll.getNextValueOf(2)).toBe(3)
        expect(ll.getPreviousValueOf(2)).toBe(1)
        expect(ll.tail).toBe(3)
        expect(ll.size).toBe(3)
        
        ll.remove(2)
        
        expect([...ll]).toEqual([1, 3])
        expect(ll.size).toBe(2)
        expect(ll.has(2)).toBeFalsy()
        
        ll.remove(3)
        
        expect([...ll]).toEqual([1])
        expect(ll.size).toBe(1)
        expect(ll.has(3)).toBeFalsy()
        
        ll.remove(1)
        
        expect([...ll]).toEqual([])
        expect(ll.size).toBe(0)
        
        ll = DoubleLinkedList.fromArray([1, 2, 3])
        
        expect(ll.size).toBe(3)
        
        ll.clear()

        expect([...ll]).toEqual([])
        expect(ll.size).toBe(0)
    })
    
    it('should insert value before', () => {
        const ll= new DoubleLinkedList();
        
        ll.push(5);
        
        expect(ll.head).toBe(ll.tail)
        expect([...ll]).toEqual([5])
        
        ll.insertValueBefore(4, 5)
        
        expect([...ll]).toEqual([4, 5])
        
        expect(ll.head).toBe(4)
        expect(ll.getNextValueOf(4)).toBe(5)
        expect(ll.getPreviousValueOf(5)).toBe(4)
        expect(ll.tail).toBe(5)
        expect(ll.size).toBe(2)
    })
    
    it('should insert value after', () => {
        const ll= new DoubleLinkedList();
        
        ll.push(5);
        
        expect(ll.head).toBe(ll.tail)
        expect([...ll]).toEqual([5])
        
        ll.insertValueAfter(6, 5)
        
        expect([...ll]).toEqual([5, 6])
        
        expect(ll.head).toBe(5)
        expect(ll.getNextValueOf(5)).toBe(6)
        expect(ll.getPreviousValueOf(6)).toBe(5)
        expect(ll.tail).toBe(6)
        expect(ll.size).toBe(2)
    })
    
    it('should reverse list', () => {
        const ll= DoubleLinkedList.fromArray([1, 2, 3, 4, 5]);
        
        expect([...ll]).toEqual([1,2,3,4,5])
        
        const c = ll.head;
        
        [5, 4, 3, 2, 1].forEach(n => {
            c && n !== c && ll.insertValueBefore(n, c);
        })
        
        expect([...ll]).toEqual([
            5,
            4,
            3,
            2,
            1
        ])
    })
})
