---
name: Injected values
order: 4.2
title: Template Values - Markup by Before Semicolon
description: How to inject and render values in templates in Markup by Before Semicolon
layout: document
---

## Injected values

As you may already know, you can inject values into [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) in JavaScript. Since markup templates are just template literals, you can inject whatever you want and Markup will handle each value for you.

### Parsing

Before we jump into specific values, lets talk about how Markup parses the HTML string in the template literals.

Just because you can inject values anywhere in the string does not mean it will be parsed the way you want. Markup sees HTML in the template literals just like HTML written in `.html` files.

This means, you can only inject values around tags openings or as attribute value. For example, injecting a value for tag name will not result in parsed DOM elements.

```javascript
const tag = 'p'

const temp = html`<${tag}>hello world</${tag}>`.render(document.body)

temp.render(document.getElementById('app'))
// renders <p>hello world</p> as string
```

The above will simple result in `<p>hello world</p>` string and not the paragraph element with "hello world" text inside.

Similarly, you cannot have a string representation of attribute key value and inject it in the body of the tag to be interpreted. The example bellow will throw an error:

```javascript
const attrs = 'id="sample"'

const temp = html`<p ${attrs}>hello world</p>`.render(document.body)

temp.render(document.getElementById('app'))
// throws: Invalid attribute object provided: id="sample"
```

There is a way to inject attributes you can learn about by reading the [attributes](./html-attributes.md) doc.

To conclude, write HTML as you know and inject value where you would write values in HTML. Those are, as attribute value between parenthesis, before, after, or inside a tag.

```javascript
const label = 'click me'
const type = 'button'

html`<button type="${type}">${label}</button>`
```

### Node

Markup templates work seamlessly with DOM nodes and this ability allows you to migrate any vanilla JavaScript solution easily to Markup templates.

You can inject any Node directly in the template and they will be rendered just fine.

```javascript
const button = document.createElement('button')
button.textContent = 'click me'
button.type = 'button'

html`${button}`.render(document.body)
```

### HTMLTemplate

Another thing you can inject in the templates for powerful compositions are the template instances themselves.

```javascript
const button = html`<button type="button">click me</button>`

html`${button}`.render(document.body)
```

This simple capability allows you to declare, store, and move around templates like you would with any data. This behavior resembles working with nodes in vanilla JavaScript and makes it easier to share and compose templates to build complex views.

Another benefits of composing templates is the fact that each template are tracked separately allowing only the part of the DOM to update when needed.

### Arrays

Injected arrays will have their items rendered as they are. This makes it super easy to render lists in general and comes handy with data handling.

```javascript
const fruits = ['apple', 'banana', 'orange', 'peach']

html`Fruits: ${fruits}`.render(document.body)
// Fruits: applebananaorangepeach
```

The list is rendered without space or commas. You can also collect a list of templates to render directly as nested templates.

```javascript
const fruits = [
    [
        html`<li>apple</li>`,
        html`<li>banana</li>`,
        html`<li>orange</li>`,
        html`<li>peach</li>`,
    ],
]

html`Fruits:
    <ul>
        ${fruits}
    </ul>`.render(document.body)
// Fruits: <ul><li>apple</li><li>banana</li><li>orange</li><li>peach</li></ul>
```

This parsing only happens up to one level though. If what you wish to render is one level deeper it will rendered as the string version of that data in JavaScript.

```javascript
const fruits = [
    [
        html`<li>apple</li>`,
        html`<li>banana</li>`,
        html`<li>orange</li>`,
        html`<li>peach</li>`,
    ],
]

html`Fruits:
    <ul>
        ${fruits}
    </ul>`.render(document.body)

// Fruits: <ul>&lt;li&gt;apple&lt;/li&gt;,&lt;li&gt;banana&lt;/li&gt;,&lt;li&gt;orange&lt;/li&gt;,&lt;li&gt;peach&lt;/li&gt;</ul>
```

### Functions

Functions are first class citizens in Markup. It is used for reactivity and lazy evaluations and it is pretty much the secret behind Markup.

Every function injected in the template is called and its value is rendered and tracked accordingly.

```javascript
const greeting = () => 'Hello World'

html`<p>${greeting}</p>`.render(document.body)
// <p>Hello World</p>
```

When you learn about [state](../state/index.md) and [effect](../state/effect.md) you will notice that its all about functions and one thing that makes it more powerful is using functions that perform calculations with state.

```javascript
const [count, setCount] = state(1)

const evenOddCount = () => (count() % 2 === 0 ? 'Even' : 'Odd')

html`
    <p>${evenOddCount}</p>
    <button type="button" onclick="${() => setCount((prev) => prev + 1)}">
        +
    </button>
`.render(document.body)
```

Markup understands that functions may contain states that change and will evaluate them whenever those state change and then perform the change in the DOM accordingly.

### Primitives

All injected primitives will be rendered as their string version.

```javascript
html`
    ${0} ${true} ${false} ${34n} ${'sample'} ${undefined} ${null}
    ${Symbol('sample')}
`.render(document.body)
// 0 true false 34 sample undefined null Symbol(sample)
```

You need to be specifically carefull with nil values like `undefined` and `null` resulting of accesing values not there. They are rendered and may not be something you want. If you wish to render nothing, always use an empty string.

### Non-Primitives

Array is the only non-primitive value that does not receive a special handling up to one level. Everything else will be render the same way as they would if stringified in JavaScript.

```javascript
html` ${{}} ${new Object()} ${new Map()} ${new Set()} ${new Date()} `.render(
    document.body
)
// [object Object]
// [object Object]
// [object Map]
// [object Set]
// Wed Oct 16 2024 18:55:38 GMT-0400 (Eastern Daylight Time)
```
