import { setElementAttribute } from "./set-element-attribute.ts";

describe("setElementAttribute", () => {
  it("should set the attribute value and remove it with null", () => {
    const el = document.createElement("div");
    
    setElementAttribute(el, "id", "test");
    
    expect(el.hasAttribute("id")).toEqual(true);
    expect(el.getAttribute("id")).toEqual("test");
    
    setElementAttribute(el, "id", null);
    
    expect(el.hasAttribute("id")).toEqual(false);
  });
  
  it("should set element non-primitive prop", () => {
    const div = document.createElement('div');
    
    setElementAttribute(div, "map", new Map());
    setElementAttribute(div, "set", new Set());
    setElementAttribute(div, "obj", {key: 'value'});
    setElementAttribute(div, "arr", [1, 2, 3]);
    setElementAttribute(div, "date", new Date(1733680446441));
    
    expect(div.outerHTML).toBe('<div map="{}" set="{}" obj="{&quot;key&quot;:&quot;value&quot;}" arr="[1,2,3]" date="&quot;2024-12-08T17:54:06.441Z&quot;"></div>')
    expect((div as any).map).toBe(undefined)
    expect((div as any).set).toBe(undefined)
    expect((div as any).obj).toBe(undefined)
    expect((div as any).arr).toBe(undefined)
    expect((div as any).date).toBe(undefined)
  })
  
  it("should set web component non-primitive prop", () => {
    class TodoItem extends HTMLElement {
      todo: { title: string } | null = null;
      #sample: unknown = null;
      
      set sample(newVal: unknown) {
        this.#sample = newVal;
      }
      
      get sample() {
        return this.#sample;
      }
      
      get no() {
        return null;
      }
    }
    
    customElements.define("todo-item", TodoItem);
    
    const el = document.createElement("todo-item") as TodoItem;
    
    setElementAttribute(el, "todo", { title: "test" });
    setElementAttribute(el, "sample", {dope: true});
    setElementAttribute(el, "no", {nope: true});
    
    expect(el.getAttribute('todo')).toEqual(null);
    expect(el.todo).toEqual({ "title": "test" });
    
    expect(el.getAttribute('sample')).toEqual(null);
    expect(el.sample).toEqual({"dope":true});
    
    expect(el.getAttribute('no')).toEqual('{"nope":true}');
    expect(el.no).toEqual(null);
    
  });
  
  it('should handle native boolean attrs', () => {
    const button = document.createElement('button');
    const input = document.createElement('input');
    
    setElementAttribute(button, "disabled", false);
    setElementAttribute(button, "readonly", false);
    setElementAttribute(input, "checked", false);
    setElementAttribute(input, "required", false);
    
    expect(button.disabled).toBe(false)
    expect(button.outerHTML).toBe('<button></button>')
    expect(input.checked).toBe(false)
    expect(input.required).toBe(false)
    expect(input.outerHTML).toBe('<input>')
    
    setElementAttribute(button, "disabled", true);
    setElementAttribute(button, "readonly", true);
    setElementAttribute(input, "checked", true);
    setElementAttribute(input, "required", true);
    
    expect(button.disabled).toBe(true)
    expect(button.outerHTML).toBe('<button disabled="true" readonly="true"></button>')
    expect(input.checked).toBe(true)
    expect(input.required).toBe(true)
    expect(input.outerHTML).toBe('<input checked="true" required="true">')
  })
  
  it('should handle id, class and style attributes', () => {
    const p = document.createElement('p');
    
    setElementAttribute(p, "id", '');
    setElementAttribute(p, "class", '');
    setElementAttribute(p, "style", '');
    
    expect(p.outerHTML).toBe('<p id="" class="" style=""></p>')
    expect(p.id).toBe('')
    // @ts-ignore
    expect(p.class).toBe(undefined)
    expect(p.className).toBe('')
    expect(p.style).not.toBe('')
    
    setElementAttribute(p, "id", 'unique');
    setElementAttribute(p, "class", 'paragraph');
    setElementAttribute(p, "style", 'color: green;');
    
    expect(p.outerHTML).toBe('<p id="unique" class="paragraph" style="color: green;"></p>')
    expect(p.id).toBe('unique')
    // @ts-ignore
    expect(p.class).toBe(undefined)
    expect(p.className).toBe('paragraph')
    expect(p.style).not.toBe('style')
  })
});
