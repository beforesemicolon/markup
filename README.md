# HTML String Renderer
Simple, Powerful, and Dynamic HTML Template System

[![npm](https://img.shields.io/npm/v/%40beforesemicolon%2Fhtml)](https://www.npmjs.com/package/@beforesemicolon/html)
![npm](https://img.shields.io/npm/l/%40beforesemicolon%2Fhtml)

The beforesemicolon `html` is a powerful and simple template system with the potential to empower the next UI Library
framework or library. It handles all your templating needs including partial rendering updates.

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
  <script src="https://unpkg.com/@beforesemicolon/html/dist/html-client.min.js"></script>

  <!-- Or a specific version -->
  <script src="https://unpkg.com/@beforesemicolon/html@1.0.0/dist/html-client.min.js"></script>

</head>
<body></body>
</html>

```

## Example

This is a simple example of a button, but you can check:
- [Some examples of how to create components](#component-patterns).
- [A Modular Todo App](https://stackblitz.com/edit/web-platform-lvonxr?file=app.js)
- [A Simple Counter App](https://stackblitz.com/edit/web-platform-adqrrf?file=app.js)
- [A Simple Time App](https://stackblitz.com/edit/web-platform-bwoxex?file=button.js)

```js
// a simple button
let label = "click me";
let disabled = false;

const btn = html`
  <button attr.disabled="${disabled}" onclick="${handleClick}">
    ${label}
  </button>
`;

function handleClick(handleClick) {
  label = "clicked";
  disabled = true;
  btn.update();
}

// tell it where to render this button
btn.render(document.body);
```

## Documentation
This library is an utility type which purpose is to help with HTML rendering via Javascript. However, because
DOM manipulation and update is the hardest thing to do in the browser, and it is taken care of by this library
any additional capabilities can be added on top of this library to fit your needs.

###### Table of Content
- [html API](#html-api)
- [render](#render)
- [Injected values](#injected-values)
- [Dynamic values](#dynamic-values)
  - [Tip](#tip)
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
    - [why and when to use `when` helper](#why-and-when-to-use-when-helper)
  - [repeat](#repeat)
    - [Why and when to use `repeat` helper](#why-and-when-to-use-repeat-helper)
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

helloWorld.render(document.body);
```

What you get back is an instance of `HtmlTemplate` which exposes the following properties
and methods:
- `render` (*method*);
- `update` (*method*);
- `refs`;
- `renderTarget`;
- `nodes`;
- `htmlTemplate`;

#### render
A method that takes and [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) or a 
[ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) instance where the template elements must be placed.

```js
import {html} from "@beforesemicolon/html"

const page = html`
  <h1>Page Title</h1>
  <p>Page description</p>
  <button>Page CTA Action</button>
`;

page.render(document.body); // <- render elements on the page
```

The `render` method will only render at a specific place once. Calling it multiple times with same values
will have no effect. 

You may want to move all [Nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node) to a different place in the DOM
and for that you must use the `force` flag to do so.

```js
...

// force the nodes to render inside the .wrapper element instead
page.render(document.querySelector('.wrapper'), true);
```

This is very useful when you want to move nodes around the DOM easily.

#### update
The `update` method updates the rendered nodes based on changes made. It only updates the elements that change
and nothing else.

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

#### refs
The `refs` property is a readonly Object of elements keyed by the name of your choosing. See [ref Attribute](#refs) section.

#### renderTarget
`renderTarget` is a readonly property will contain the element you passed to the `render` method.

#### nodes
`nodes` is a readonly property will contain all the direct child node references specified in your `html` template.

#### htmlTemplate
The `htmlTemplate` property will contain the template string representation with your values represented in a string variable
only significant for this library.

### Injected values
Because the template is a [Javascript Template String/Literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals),
you may inject values anywhere you see fit.

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

These values will be correctly added to the DOM in a way it makes sense for the render.

Any value will be treated as static values but if you pass a function, these `html` assumes you want these functions
to be called in order to retrieve the values. These are called [Dynamic values](#dynamic-values) and should be used 
whenever you know a certain value will change.

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

page.update();
```

#### Tip
Since the template expects a function for dynamic values, you may create a simple utility that will
make things look much easier:

```js
const dynamicVal = (val) => {
    return [
      () => val,
      (newVal) => {
        val = newVal;
      }
    ]
}
```

It can be used like so:

```js
import {html} from "@beforesemicolon/html"

let [title, setTitle] = dynamicVal("Page Title");
let [description, setDescription] = dynamicVal("Page description");

const page = html`
  <h1>${title}</h1> 
  <p>${description}</p>
  <button>Page CTA Action</button>
`;

setTitle("Title changed")
setDescription("The description was updated")

page.update(); // grab the changes
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
```

The way you access these element references is by using the [refs Object](#refs) from the `HTMLRenderTemplate` instance
returned by `html`.

```js
const pDescTag = page.refs["desc"]; // returns a HTMLParagraphElement instance
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
`Pattern: attr.class.NAME_OF_THE_CLASS="BOOLEAN_RENDER_FLAG" or attr.class="NAME_OF_THE_CLASS, BOOLEAN_RENDER_FLAG"`

The examples bellow show 2 patterns on how to use the `attr` attribute to set class names. 
It will only add the `loading` class if the `loading` variable value is `true`.

```js
let loading = true;

const btn = html`<button attr.class.loading="${loading}">click me</button>`
```

or 

```js
let loading = true;

const btn = html`<button attr.class="loading, ${loading}">click me</button>`
```

#### style
`Pattern: attr.style.STYLE_PROPERTY="STYLE_PROPERTY_VALUE, BOOLEAN_RENDER_FLAG" or attr.style="VALID_INLINE_CSS, BOOLEAN_RENDER_FLAG"`

The examples bellow show 2 patterns on how to use the `attr` attribute to set inline style.
It will only the background color if the `cta` variable value is `true`

```js
let cta = true;

const btn = html`<button attr.style.background-color="orange, ${cta}" >click me</button>`
```

Or

```js
let cta = true;

const btn = html`<button attr.style="background-color: orange, ${cta}" >click me</button>`
```

#### data
`Pattern: attr.data.NAME_OF_THE_DATA="DATA_VALUE, BOOLEAN_RENDER_FLAG"`

The bellow example shows how to use `attr` to dynamically set a data attribute.

```js
let label = true;

const btn = html`<button attr.data.aria-label="${label}, ${label.trim().length > 1}" >click me</button>`
```

#### any other attributes
`Pattern: attr.NAME_OF_THE_ATTRIBUTE="ATTRIBUTE_VALUE, BOOLEAN_RENDER_FLAG"`

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
When you use [dynamic values](#dynamic-values) you use functions which can lead to cases where values returned are 
returned on each call which will force the DOM to update every time.

In those cases you need to create static references and return them.

Allow me to elaborate:

Bellow is okay because the value returned is a [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

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

This is because every time this function is called, it will generate a new instance of `HTMLRenderTemplate` which
for `html` is a change.

The way to fix this is by create static references

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
of `HTMLRenderTemplate` because they are the value of the variables declared above.

In general always be aware of this whenever the values returned by these [dynamic values](#dynamic-values) are not
primitive values.

### Render Helpers
A few render helpers are made available so you can use them to handle things more complex to improve your rendering performance.

#### when
`when(flag: boolean | () => boolean, ifTrue: any, ifFalse?: any)`

The `when` helper is like a ternary, it takes a value and one or two things to render.

```js
import {html, when} from "@beforesemicolon/html";

let loading = false;

const btn = html`
  <button>${when(
    () => loading, 
        html`<span>Loading...</span>`, 
        html`<span>Click Me</span>`
  )}</button>
`;
```

##### Why and when to use "when" helper?
The above example is very simple and could be done without the `when` helper like so:

```js
let loading = false;

const btn = html`
  <button>${() => loading ? html`<span>Loading...</span>` : html`<span>Click Me</span>`}</button>
`;
```

What is happening in this example is that whenever the [update method](#update) is called, this dynamic
value will be called and a new instance of `span` tag will be created regardless of the `loading` value
causing the DOM to update unnecessarily.

By using `when`, this problem is eliminated by ensuring that the DOM stays the same if the value does not
change.

However, if you are just rendering primitive values like string and numbers, you may skip `when` all together.
Bellow is just fine without `when` although using it won't hurt. See [memoise elements session](#memoise-elements) for
more details.

```js
let loading = false;

const btn = html`
  <button>${() => loading ? "Loading..." : "Click Me"}</button>
`;
```

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

const todoItems: Todo[] = Array.from({length: 10}, (_, idx) => ({name: `todo item ${idx + 1}`}))

const todos = html`
  <ul>
    ${repeat<Todo>(() => todoItems, (item) => html`<li>${item.name}</li>`)}
  </ul>
`;
```


##### Why and when to use "repeat" helper?
You should use `repeat` helper whenever there are items to repeat in the DOM following a pattern.
The reason to use it is simply a memoization one. See [memoise elements session](#memoise-elements) for
more details.

Using array map to rende items works just fine as `html` already handles list like a champ and remembers the data
that changes the DOM. However, when you are dynamically creating a list with map, you are providing a new
array of items which `html` interpret as new list and re-renders the entire list.

```ts
const todoItems = Array.from({length: 10}, (_, idx) => ({name: `todo item ${idx + 1}`}))

const todos = html`
  <ul>
    ${() => todoItems.map((item) => html`<li>${item.name}</li>`)}
  </ul>
`;

todoItems.push({name: "new item"})

todos.update()
```

The solution would be to create a list of memoise items which is what the `repeat` helper is doing. Below
is what you would need to do if you do not want to use `repeat` helper and still want to avoid unnecessary
DOM updates.

```ts
const todoItems = Array.from({length: 10}, (_, idx) => html`<li>item ${idx + 1}</li>`)

const todos = html`
  <ul>
    ${() => todoItems}
  </ul>
`;

todoItems.push(html`<li>new item</li>`)

todos.update()
```

However, in a real world you are not dealing with a list of template items but data. 
Therefore, `repeat` helper exists to do all that work for you while you can focus on the data.

```ts
const todoItems = Array.from({length: 10}, (_, idx) => ({name: `todo item ${idx + 1}`}))

const todos = html`
  <ul>
    ${repeat<Todo>(() => todoItems, (item) => html`<li>${item.name}</li>`)}
  </ul>
`;

todoItems.push({name: "new item"})

todos.update()
```

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
    template: HTMLRenderTemplate;
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
related to a `html` template in a single function and return the `HTMLRenderTemplate` instance.

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
}: ButtonProps) => {
    return html`
      <button type="${type}" attr.disabled="${disabled}" onclick="${onClick}">
        ${label}
      </button>
    `;
}

// app.html.ts
const App = () => {
    let app: HTMLRenderTemplate;
    let count = 0;
    
    const plusBtn = Button({
        label: "+",
        onClick: () => {
            count += 1;
            app.update();		
        }
    })
    
    const minusBtn = Button({
        label: "-",
        onClick: () => {
            count -= 1;
            app.update();
        }
    })
    
    app = html`
      <h1>Cool App</h1>
      <p>${() => count}</p>
      ${plusBtn} ${minusBtn}
    `;
    
    return app;
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
        onClick = () => {
        }
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
	app: HTMLRenderTemplate;
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
        `.render(target);
	}
}

new App(document.body)
```

This is in no way telling you how you SHOULD create class components. This is just an example and you can approach
this in whatever way works for you.
