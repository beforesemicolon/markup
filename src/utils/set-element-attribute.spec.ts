import { setElementAttribute } from "./set-element-attribute";

describe("setElementAttribute", () => {
  it("should set the attribute value and remove it with null", () => {
    const el = document.createElement("div");
    
    setElementAttribute(el, "id", "test");
    
    expect(el.hasAttribute("id")).toEqual(true);
    expect(el.getAttribute("id")).toEqual("test");
    
    setElementAttribute(el, "id", null);
    
    expect(el.hasAttribute("id")).toEqual(false);
  });
  
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
    
    expect(el.getAttribute('todo')).toEqual('{"title":"test"}');
    expect(el.todo).toEqual({ "title": "test" });
    
    expect(el.getAttribute('sample')).toEqual('{"dope":true}');
    expect(el.sample).toEqual({"dope":true});
    
    expect(el.getAttribute('no')).toEqual('{"nope":true}');
    expect(el.no).toEqual(null);
    
  });
});
