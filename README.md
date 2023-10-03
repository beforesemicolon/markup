# HTML Templating System
Simple Reactive HTML Template System

⚠️ This is still in Beta and contains parts which are still under development and experimentation.

⚠️ Do NOT use in production!

[![npm](https://img.shields.io/npm/v/%40beforesemicolon%2Fhtml)](https://www.npmjs.com/package/@beforesemicolon/html)
![npm](https://img.shields.io/npm/l/%40beforesemicolon%2Fhtml)

The beforesemicolon `html` is a plug-and-play template system for those who need the bare minimal yet powerful
way to build user interface. Its small size and ready-to-go nature makes it perfect for quick prototypes, 
UI components library, browser extensions, and side projects. But make no mistake, it has all the templating
features for a big project and serves as a perfect start to build any UI framework or library.

### Motivation
Most UI libraries need too much setup and require build with a steep learning curve. If you find a good templating system
its either not powerful enough or requires extra things to make it work by itself.

This templating system is standalone system. You don't need anything else to start rendering and reacting to changes.

It requires **no build**, **its tiny**, and the API is literally **2 main things to learn**, and you are ready to go. 
It is pretty much HTML and Javascript so the learning curve is extremely small.

### Example
Below is a simple todo app and as you can see, its pretty much HTML and Javascript.

```ts
import {html, state, repeat} from "@beforesemicolon/html";

interface TodoItem {
  name: string;
  description: string;
  id: string;
}

const [todos, updateTodos] = state<Array<TodoItem>>([])

const createTodo = () => {
  const name = window.prompt("Enter todo name");
  const description = window.prompt("Enter todo description") ?? '';
  
  if (name) {
    updateTodos(prev => [...prev, {name, description, id: crypto.randomUUID()}])
  }
}

const deleteTodo = id => {
  updateTodos(prev => prev.filter(todo => todo.id !== id))
}

const TodoItem = ({name, description, id}: TodoItem) => html`
  <div class="todo-item">
    <h3>${name}</h3>
    <p>${description}</p>
    <button type="button" onclick="${() => deleteTodo(id)}">delete</button>
  </div>
`;

const TodoApp = html`
  <h2>Todo App</h2>
  <button type="button" onclick="${createTodo}">add new</button>
  <div class="todo-list">
    ${repeat(todos, TodoItem)}
  </div>
`

TodoApp.render(document.body)
```

#### More examples

This is a simple example of a button, but you can check:
- [Some examples of how to create components](#component-patterns).
- [A Modular Todo App](https://stackblitz.com/edit/web-platform-lvonxr?file=app.js)
- [A Simple Counter App](https://stackblitz.com/edit/web-platform-adqrrf?file=app.js)
- [A Simple Time App](https://stackblitz.com/edit/web-platform-bwoxex?file=button.js)

## Install
```
npm i @beforesemicolon/html
```

## Use directly in the Browser
This library requires no build or parsing. The CDN package is one digit killobyte in size, tiny!

```html
<!DOCTYPE html>
<html lang="en">
<head>

  <!-- Grab the latest version -->
  <script src="https://unpkg.com/@beforesemicolon/html/dist/client.js"></script>

  <!-- Or a specific version -->
  <script src="https://unpkg.com/@beforesemicolon/html@1.0.0/dist/client.js"></script>

</head>
<body></body>
</html>

```

## Documentation

###### Table of Content
- [html API](#html-api)
  - [`render`](#render)
  - [`update`](#update)
  - [`onUpdate`](#onupdate)
  - [`replace`](#replace)
  - [`refs`](#refs)
  - [`renderTarget`](#rendertarget)
  - [`nodes`](#nodes)
- [Template values](#template-values)
- [Dynamic values](#dynamic-values)
  - [state](#state)
- [Injecting HTML](#injecting-html)
- [The `ref` Attribute](#the-ref-attribute)
- [The `attr` Attribute](#the-attr-attribute)
  - [booleans](#booleans)
  - [class](#class)
  - [style](#style)
  - [data](#data)
  - [any other attributes](#any-other-attributes)
  - [BOOLEAN_RENDER_FLAG](#booleanrenderflag)
- [Memoise elements](#memoise-elements)
- [Render Helpers](#render-helpers)
  - [when](#when)
  - [repeat](#repeat)
  - [custom helper](#custom-helper)
  - [reactive helper](#reactive-helper)
- [element](#element)
- [Component Patterns](#component-patterns)
  - [Web Component](#web-component)
  - [Functional Component](#functional-component)
  - [Class Component](#class-component)

### html API
The main API you will be interacting with is the `html` tag function for 
[Javascript Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

All you need to do is specify the HTML string you would like to render.

```js
import {html} from "@beforesemicolon/html"

const helloWorld = html`<h1>Hello World</h1>`;
```

What you get back is an instance of `HtmlTemplate` which exposes the following properties
and methods:
- `render` (*method*);
- `update` (*method*);
- `onUpdate` (*method*);
- `replace` (*method*);
- `refs`;
- `renderTarget`;
- `nodes`;

#### render
The `render` method simply takes and [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) or a 
[ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) instance where you want the content to be placed. It does that by appending
to the element you provided.

```js
import {html} from "@beforesemicolon/html"

const page = html`
  <h1>Page Title</h1>
  <p>Page description</p>
  <button>Page CTA Action</button>
`;

page.render(document.body); // <- appends to the body
```

The `render` method will only render at a specific place once. Calling it multiple times with same values
will have no effect. 

You may want to move all [Nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node) to a different place in the DOM
and for that you must use the `force` flag to do so.

```js
// appends all already rendered nodes into the .wrapper element
page.render(document.querySelector('.wrapper'), true);
```

#### update
The `update` method updates the rendered nodes based on changes made. It only updates the elements which values
associated with have changed. The DOM is not affected if the value remains the same and the `update` is
called repeatedly.

```js
import {html} from "@beforesemicolon/html"

let title = "Page Title";
const page = html`
  // use a lambda to mark the value as dynamic, meaning, it can change
  <h1>${() => title}</h1> 
  <p>Page description</p>
  <button>Page CTA Action</button>
`;

page.render(document.body);

title = "Page Title Changed";

page.update(); // make the page aware of the title change
```

See [Injected values](#injected-values) and [Dynamic values](#dynamic-values) sections for more details on values
you can inject in your templates.

#### onUpdate
The `onUpdate` is a method you can use to provide a function that must be called every time the `update` was called.
This is regardless of whether the DOM changed or not. It is a perfecrt place to react to anything that might have changed
in the DOM.

```ts
const [count, updateCount] = state<number>(0);

const counter = html`<span>${count}</span>`;

const unsubscribe = counter.onUpdate(() => {
  // logic here
})

updateCount(23); // will trigger onUpdate
```

It returns a function you can call to unsubscribe and the function you provide will not get called with anything.

#### replace
The `replace` method works like the [render](#render) method but instead of appending to the provided element
it replaces it. It takes any DOM element or a [html template instance](#htmltemplate) replacing only
if the element(s) is rendered somewhere in the document.

```ts
const btn = html`<button>Page CTA Action</button>`;

btn.replace(document.body.querySelector('.target'))
```

One specific thing about this method is that it will not replace `HTML`, `BODY`, or `HEAD` elements. 
Also, it will not replace `ShadowRoot` as well. Providing invalid replacing target will
result in an error.

Another cool things is that you can provide other `HTMLTemplate` instances, and it will replace it
as well.

```ts
const span = html`<span>sample</button>`;

span.render(document.body)

const btn = html`<button>Page CTA Action</button>`;

// will remove all nodes of the span template
// replacing them with all nodes from btn template
btn.replace(span)
```

#### refs
The `refs` property is a readonly Object of elements keyed by the name of your choosing. See [ref Attribute](#refs) section.

#### renderTarget
`renderTarget` is a readonly property will contain the element you passed to the `render` method.

#### nodes
`nodes` is a readonly property will contain all the direct child node references specified in your `html` template.

These nodes list may change based on rendering conditions placed inside the template.

### Template values
Because the template is just a [Javascript Template String/Literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals),
you may place values anywhere valid in HTML you want and will work fine.

```js
import {html} from "@beforesemicolon/html"

let title = "Page Title";
let description = "Page description";

const page = html`
  <h1>${title}</h1> 
  <p>${description}</p>
  <button>Page CTA Action</button>
`;
```

You must place values inside valid places like between quotes for attributes or inside or outside a tag.
For example, below is invalid

```js
html`<input ${'disabled'} />`;
// will render <input />
```

```js
html`<input placeholder="${'Enter text'}" />`;
// will render <input placeholder="Enter text" />
```

Any value will be treated as static values but if you pass a function, these are treated like getter functions. 
These are called [Dynamic values](#dynamic-values) and should be used whenever you know a certain value will change.

In general, keep the values that will not change as static to avoid not needed calculations.

### Dynamic values
We call "dynamic value" anything added to the template via a function which are called to retrieve the values.

```js
import {html} from "@beforesemicolon/html"

let title = "Page Title";
let description = "Page description";

const page = html`
  <h1>${() => title}</h1> 
  <p>${() => description}</p>
  <button>Page CTA Action</button>
`;
```

The `html` template will call these functions to collect the values by default.

Whenever you make a change to the values, you may call the [update method](#update) to reflect these changes on the DOM.

```js
import {html} from "@beforesemicolon/html"

let title = "Page Title";
let description = "Page description";

const page = html`
  <h1>${() => title}</h1> 
  <p>${() => description}</p>
  <button>Page CTA Action</button>
`;

title = "Title changed";

page.update(); // will update the title in the DOM
```

#### state
The best way to work with dynamic values is to use the built-in `state` utility.

```js
import {html, state} from "@beforesemicolon/html"

let [count, setCount] = state(0);

const page = html`
  <p>${count}</p>
  <button type="button" 
    onclick="${() => setCount(prev => prev + 1)}">+</button>
  <button type="button" 
    onclick="${() => setCount(prev => prev - 1)}">-</button>
`;
```

The `state` function takes two arguments:
- `value`: the initial value
- `subscriber` (optional): a function that gets called for every value change

It returns an array with 3 functions:
- `getter`: a function that returns the value
- `setter` a function that set the value by taking a new one or a function that returns the new value.
- `unsubscriber` a function that stops listening to value changes.

```js
setCount(count => count + 1)
// or
setCount(count() + 1)
```

Which one to use is up to you and makes no difference in how things get handled.

##### understanding state

The `state` is not a signal and does not work like React state. State is a simple pair of getter and setter
you can subscribe to and ONLY the template that uses it can respond to its change.

```js
// this template IS subscribed to the state and will
// respond to any stat changes regardless of where it is been used
const countParagraph = html`<p>${count}</p>`; 

// this template is NOT subscribed to the state
// it will not respond to changes of the state but
const page = html`
  ${countParagraph}
  <button type="button" 
    onclick="${() => setCount(prev => prev + 1)}">+</button>
  <button type="button" 
    onclick="${() => setCount(prev => prev - 1)}">-</button>
`;
```

This is perfect because it guarantees that ONLY the part of the template using the state gets re-rendered
making the template fast and efficient.

It is important to understand that just because you are using state getter in the template, doest NOT mean that
the template is subscribed to its value. The state getter needs to be used DIRECTLY in the template
or as a DIRECT ARGUMENT of a [reactive helper](#reactive-helper).

All the 2 built-in [helpers](#reactive-helper) are reactive and can take state getter as argument but if
you pass a function, for example, that uses the state getter, the template will not rect to its changes.

```js
const [todos, updateTodos] = state([]);

// the repeat is provided with the state getter directly which is shared with template
// causing the template to react to its value changes
html`${repeat(todos, todo => html`<li>${todo.name}</li>`)}`; // will update on todos state change

// the repeat is provided a function that returns a getter value and does have acces to the state
// causing it to NOT react to state changes
html`${repeat(() => todos(), todo => html`<li>${todo.name}</li>`)}`; // will NOT update on todos state change
```

You will need to use the state directly in the template or with [reactive-helpers](#reactive-helper) directly
in order for the DOM to react to changes, otherwise you must call the [update](#update) method for the template

### Injecting HTML
Sometimes you just want to inject HTML or any type of text as is safely in the DOM.

If you want to just place text as is, simply injecting it in the template.

```js
const someCode = '<p>will encode HTML characters safely into the DOM</p>';

const code = html`<pre><code>${someCode}</code></pre>`;
```

If you want the text to be parsed, use the `html` as a function and pass it an array of html strings..

```js
const someCode = '<p>will be treated as HTML DOM element</p>';

const code = html`<pre><code>${html[someCode]}</code></pre>`;
```

### The `ref` Attribute
The `ref` attribute is an attribute you can use to mark the elements you want to have access to.

```js
import {html} from "@beforesemicolon/html"

const page = html`
  <h1>Page Title</h1>
  // set a ref attribute on any element
  <p ref="desc">Page description</p>
  <button>Page CTA Action</button>
`;

page.render(document.body) // must render to get the DOM references
```

The way you access these element references is by using the [refs Object](#refs) from the `HTMLTemplate` instance
returned by `html`.

```js
const [pDescTag] = page.refs["desc"]; // return array of element references
```

### The `attr` Attribute
The `attr` attribute is a powerful attribute that lets you dynamically set attributes based on dynamic values.

It can be used to set almost any attribute and can even target specific properties as you will learn about bellow.

#### booleans
`Pattern: attr.NAME_OF_THE_ATTRIBUTE="BOOLEAN_RENDER_FLAG"`

HTML has [boolean attributes](https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML) which are special
attributes that do not necessarily need value. You can look at list of [valid HTML attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes) to see
which ones are considered to be booleans. 

They affect the element just by being set. Therefore, doing something like bellow will not have the effect you desire:

```js
let disabled = false;

const btn = html`<button disabled="${disabled}">click me</button>`
```

Because it results in:

```html
<button disabled="false">click me</button>
```

Which still makes the button disabled.

Instead, use the `attr` attribute.

```js
let disabled = false;

const btn = html`<button attr.disabled="${disabled}">click me</button>`
```

which will result in:

```html
<button>click me</button>
```

This library is aware of all valid HTML boolean attributes and will take care of them for you via the `attr` attribute.

#### class
`Pattern: attr.class.NAME_OF_THE_CLASS="BOOLEAN_RENDER_FLAG" or attr.class="NAME_OF_THE_CLASS | BOOLEAN_RENDER_FLAG"`

The examples bellow show 2 patterns on how to use the `attr` attribute to set class names. 
It will only add the `loading` class if the `loading` variable value is `true`.

```js
let loading = true;

const btn = html`<button attr.class.loading="${loading}">click me</button>`
```

or 

```js
let loading = true;

const btn = html`<button attr.class="loading | ${loading}">click me</button>`
```

#### style
`Pattern: attr.style.STYLE_PROPERTY="STYLE_PROPERTY_VALUE | BOOLEAN_RENDER_FLAG" or attr.style="VALID_INLINE_CSS | BOOLEAN_RENDER_FLAG"`

The examples bellow show 2 patterns on how to use the `attr` attribute to set inline style.
It will only the background color if the `cta` variable value is `true`

```js
let cta = true;

const btn = html`<button attr.style.background-color="orange | ${cta}" >click me</button>`
```

Or

```js
let cta = true;

const btn = html`<button attr.style="background-color: orange | ${cta}" >click me</button>`
```

#### data
`Pattern: attr.data.NAME_OF_THE_DATA="DATA_VALUE, BOOLEAN_RENDER_FLAG"`

The bellow example shows how to use `attr` to dynamically set a data attribute.

```js
let label = true;

const btn = html`<button attr.data.aria-label="${label} | ${label.trim().length > 1}" >click me</button>`
```

#### any other attributes
`Pattern: attr.NAME_OF_THE_ATTRIBUTE="ATTRIBUTE_VALUE | BOOLEAN_RENDER_FLAG"`

#### BOOLEAN_RENDER_FLAG
The boolean flag is optional when using `attr` attribute and defaults to `true`. In that case you can just
not use the `attr` attribute all together if the boolean will always be true or omitted.

```js
let label = true;

html`<button attr.data.aria-label="${label}" >click me</button>`

// same as

html`<button data.aria-label="${label}" >click me</button>`
```

The only time the boolean value can be omitted is with [boolean attributes](#booleans), even if they have values, 
like in the case of [hidden](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden) which is
a boolean attribute and have possible values.

### Memoise elements
When you use [dynamic values](#dynamic-values) the value is capture with every update which works fine for primitive
values but not so much with new instance because `html` template with rely on data to create new DOM
which will result in new DOM elements created on every update.

In those cases you need to create static references and return them.

Allow me to elaborate:

Bellow is okay because the value returned is a [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) (`string`).

```js
let valid = true;

html`<span>${() => valid ? "valid" : "invalid"}</span>`;

setInterval(() => {
  valid = false;
  span.update()
}, 1000)
```

The interval runs every second and `html` will try to update the element but will not touch the DOM because the value
is always the same. However, the following will trigger a DOM update on every update.

```js
let valid = true;

html`<span>${() => valid ? html`valid` : html`invalid`}</span>`;

setInterval(() => {
  valid = false;
  span.update()
}, 1000)
```

This will update the DOM every second even though visually the thing rendered will be an `"invalid"` text node.

This is because every time this function is called, it will generate a new instance of `HTMLTemplate` which
for `html` is a change.

The way to fix this is by creating static references

```js
let valid = true;
const validText = html`valid`;
const invalidText = html`invalid`;

const span = html`<span>${() => valid ? validText : invalidText}</span>`;

span.render(document.body)

setInterval(() => {
  valid = true;
  span.update()
}, 1000)
```

This will not waste DOM updates because no matter how many times the interval runs, `html` will always get the same instance
of `HTMLTemplate` because they are the value of the variables declared above.

In general always be aware of this whenever the values returned by these [dynamic values](#dynamic-values) are not
primitive values.

All built-in helper already memoise data and that's why you should use them.

### Render Helpers
A render helper is just a function you place in the template that handles some logic related to rendering some
HTML. They can take anything you want and return anything you want.

There are two built-in render helpers:
- [when](#when) : to conditionally render content based on some state or logic
- [repeat](#repeat) : to repeat content on the DOM based on some number or list

All these are [reactive helpers](#reactive-helper) which means that can take a [state](#state) getter and react to the changes.

You can also create [custom helpers](#custom-helper) which can be static or reactive.

#### when
`when(
  flag: boolean | () => boolean, 
  ifTrue: any | () => any, 
  ifFalse?: any | () => any
)`

The `when` helper is like a ternary, it takes a value and one or two things to render.

```js
const [loading, setLoading] = state(false);

const btn = html`
  <button>${when(loading,
    html`<span>Loading...</span>`, 
    html`<span>Click Me</span>`
  )}</button>
`;
```

If you provide a state getter directly to the `when` helper it will react to its changes and re-run.

#### repeat
`repeat<T>(countOrArray: number | Array<T> | () => number | Array<T>, renderCallback: () => any)`

The repeat helper will handle any template needs to repeat elements on the DOM.

It can repeat elements based on given `count` and you can use callback to read the count value
and use it in the template.

```js
import {html, repeat} from "@beforesemicolon/html";

const todos = html`
  <ul>
    ${repeat(10, (n) => html`<li>item ${n}</li>`)}
  </ul>
`;
```

You may also provide an array of items to be rendered.

```ts
import {html, repeat} from "@beforesemicolon/html";

interface Todo {
  name: string;
}

const [todos, updateTodos] = state<Todo>([])

html`<ul>
  ${repeat<Todo>(todos, (item) => html`<li>${item.name}</li>`)}
</ul>`;
```
### Custom Helper
A custom helper is simply a function that is placed in the template and aids with some rendering logic.

```js
const draggable = (target) => {
  const dragStart = (event) => {
    event.dataTransfer.setData("text/plain", event.target.id);
  }
  
  return html`<div draggable ondragstart="${dragStart}">${target}</div>`
}

html`${draggable(html`<div>Drag Me</div>`)}`;
```

#### Reactive helper
A reactive helper is just a function wrapped by `helper` util that might need to react to some state data.

```js
import {helper, html, state} from "@beforesemicolon/html";

const ellipsis = helper((list, max, content) => {
  const data = typeof list === "function" ? list() : list;
  
  if(data.length > max) {
    return html`${data.map(content)}...`;
  }
  
  return data.map(content);
});

const [names, setNames] = state([]);

html`${ellipsis(names, 5, name => html`<div>${name}</div>`)}`;
```

Custom helpers can also return function to actually do the rendering and the outer function to cache data.

```js
const ellipsis = helper((list, max, content) => {
  // use the outer function to create static data and cache things
  let renderList = [];
  
  // return a new render function that handles the render logic
  return () => {
    const data = typeof list === "function" ? list() : list;

    // grab previous generated item HTMLTemplate or create new one
    renderList = data.slice(0, max).map((item, idx) => renderList[idx] || content(item))

    if(renderList.length === max) {
      return html`${renderList}...`;
    }

    return renderList;
  }
});

const [names, setNames] = state([]);

html`${ellipsis(names, 5, name => html`<div>${name}</div>`)}`;
```

It is recommended that you use the outer function to cache or do certain things only once and the inner function
for things that need to happen on every state change.

A good example is this draggable helper which does all its thing in the outer function
and returns a function that will handle the rendering, in this case, just returns it.

```js
const draggable = (target) => {
    const id = Math.floor(Math.random() * 1000000);
    
    const onDragStart = e => {
        e.dataTransfer.setData("text/plain", String(id));
        e.target.style.opacity = '0.2'
    }
    
    const onDragEnd = e => {
        e.target.style.opacity = '1'
    }
    
    const content = html`
      <div draggable="true" class="draggable-item" id="${id}"
       ondragstart="${onDragStart}"
       ondragend="${onDragEnd}"
       >${target}</div>`;
    
    return () => content;
}
```

What this means is that no matter how the state change, what will render will remain the same
causing the DOM to never shift between changes.

A helper can also be used for attribute values.

```ts
const is = helper(<T>(state: () => T, val: unknown) => {
  return () => state() === val
})

const [tab, setTab] = state('tab')

html`<li attr.class="active | ${is(tab, 'home')}">Home</li>`
```

### element
There is also a `element` utility function which is just a simpler way to create DOM elements. What is special
about it is that you can do one call and the entire element is put together. What is more interesting
in it is that it handle Web Component props the way it should be.

```js
import {html, element, state} from "@beforesemicolon/html"

let [count, setCount] = state(0);

const incBtn = element('button', {
  textContent: "+",
  attributes: {
    type: "button",
    onclick: () => {
      setCount(prev => prev + 1)
    }
  }
});

const page = html`
  <p>${count}</p>
  ${incBtn}
`;
```

It takes two arguments:
- `TagName`: the name of the element you want to create
- `options`
  - `textContent`: pure text
  - `htmlContent`: html string
  - `attributes`: any key value pair for the element, including event listeners and web component props.
  - `ns`: the [namespaceURI](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS#parameters) which is useful if you are tyring to create SVG elements.


### Component Patterns
This library is not a UI library but because it handles such a crucial feature of UI libraries, it can be used
to create components of any type easily. For example:
- Web Component
- Functional Component
- Class Component

#### Web Component
Perhaps, the most powerful way to create components is to use [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).

The `html` library handles to complex and tedious aspects of it all and the component is just a wrapper with magical hooks
to tap into.

Bellow is an example of a simple button which does not need to do all the tedious DOM manipulations.

```ts
class BFSButton extends HTMLElement {
    static observedAttributes = ["disabled", "type"];
    template: HTMLTemplate;
    disabled = false;
    type = "button";
	
    constructor() {
        super();
        
        const shadow = this.attachShadow({mode: "open"});
        
        const handleClick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.dispatchEvent(new CustomEvent("click"));
        }
        
        this.template = html`
            <button 
                attr.disabled="${() => this.disabled}"
                type="${() => this.type}"
                onclick="${handleClick}"
                >
                <slot></slot>
            </button>
        `;
        
        this.template.render(shadow);
    }
		
	
    attributeChangedCallback(name, oldVal, newVal) {
        switch(name) {
            case "disabled":
                this.disabled = this.hasAttribute("disabled");
                break;
            case "type":
                this.type = ["submit", "button"].includes(newVal) ? newVal : this.type;
                break;
        }
        
        this.template.update();
    }
}

customElements.define("bfs-button", BFSButton);
```

You can now use the tag like so:

```html
<bfs-button type="submit" onclick="console.log(event)">save</bfs-button>
<bfs-button disabled>saved</bfs-button>
<bfs-button >click me</bfs-button>
```

#### Functional Component
Bellow is a simple example of how you can create functional components easily by putting all the logic
related to a `html` template in a single function and return the `HTMLTemplate` instance.

```ts
// button.html.ts
interface ButtonProps {
  type?: "button" | "submit";
  disabled?: boolean;
  label?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const Button = ({
  type = "button",
  disabled = false,
  label = "",
  onClick = () => {}
}: ButtonProps) => html`
  <button type="${type}" attr.disabled="${disabled}" onclick="${onClick}">
    ${label}
  </button>
`

// app.html.ts
const App = () => {
  const [count, setCount] = state(0);
  
  const plusBtn = Button({
    label: "+",
    onClick: () => {
        setCount(prev => prev + 1);
    }
  })
  
  const minusBtn = Button({
    label: "-",
    onClick: () => {
        setCount(prev => prev - 1);
    }
  })
  
  return html`
    <h1>Count App</h1>
    <p>${count}</p>
    ${plusBtn} ${minusBtn}
  `;
}

App().render(document.body)
```

This is in no way telling you how you SHOULD create functional components. This is just an example and you can approach
this in whatever way works for you.

#### Class Component
Here an example of how you can create a components using class as well.

```ts
// button.html.ts
class Button {
  constructor({
    type = "button",
    disabled = false,
    label = "",
    onClick = () => {}
  }: ButtonProps) {
      return html`
        <button type="${type}" attr.disabled="${disabled}" onclick="${onClick}">
          ${label}
        </button>
      `;
  }
}

// app.html.ts
class App {
	app: HTMLTemplate;
    count = 0;
    
    plusBtn = new Button({
        label: "+",
        onClick: () => {
            this.count += 1;
            this.app.update();
        }
    })
    
    minusBtn = new Button({
        label: "-",
        onClick: () => {
            this.count -= 1;
            this.app.update();
        }
    })
	
    constructor(target: HTMLElement) {
      this.app =  html`
        <h1>Cool App</h1>
        <p>${() => this.count}</p>
        ${this.plusBtn} ${this.minusBtn}
      `;
      this.app.render(target);
    }
}

new App(document.body)
```

This is in no way telling you how you SHOULD create class components. This is just an example and you can approach
this in whatever way works for you.
