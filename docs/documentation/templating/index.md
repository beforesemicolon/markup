---
name: Create & Render
order: 4
title: Render Template - Markup by Before Semicolon
description: How to create and render a templates in Markup by Before Semicolon
layout: document
---

## Templates

Markup uses [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) called `html` to describe the HTML you want to render.

```javascript
const temp = html`<h1>Hello World</h1>`
```

The `html` returns an `HTMLTemplate` instance containing methods and properties you can use to access or perform many actions.

### Rendering

There are few ways to render a template after you define it:

-   `render`: Takes a DOM element to append the template to;
-   `replace`: Takes a DOM element or another HTML template to replace in the DOM;
-   `insertAfter`: Takes a DOM element to insert the template after;

#### render

```typescript
render(target: ShadowRoot | HTMLElement | Element | DocumentFragment): this;
```

The `render` method will take a `ShadowRoot`, `HTMLElement`, or `DocumentFragment` to append the content to.

```javascript
temp.render(document.body)
```

The parsing of the template happens at render time and will only happen once. This is also true for other rendering methods.

Calling the `render` method with same target repeatedly will only work once. You can call it with a different target to move content to a different place.

```javascript
temp.render(document.body) // will parse and append to document.body
temp.render(document.body) // will be ignored
temp.render(document.body) // will be ignored
temp.render(document.getElementById('app')) // will move content to #app
```

#### replace

```typescript
replace(target: Node | HtmlTemplate): this;
```

The `replace` method takes any `HTMLTemplate` or [Node](https://developer.mozilla.org/en-US/docs/Web/API/Node) as long as it is not `ShadowRoot`, `HTMLBodyElement`, `HTMLHeadElement`, or `HTMLHtmlElement` to replace in the DOM.

```javascript
temp.replace(document.getElementById('app'))
```

As long as the target node has a parent node, the replace it and similar to `render` method, it will only parse content once.

```javascript
const loading = html`<p>loading...</p>
    <p></p>`

html`${loading}`.render(document.body)

doSomething().then(() => {
    const done = html`<p>Done</p>
        <p></p>`

    done.replace(loading)
})
```

The `replace` method is powerful especially when working with asynchronous rendering when you need to render something temporarily and replace it later. This is what [suspense](../utilities/suspense.md) utility does.

#### insertAfter

```typescript
insertAfter(target: Node | HtmlTemplate): this;
```

The `insertAfter` method works exactly like the `render` method. The only difference is that it adds the template content after the target node provided.

```javascript
temp.insertAfter(document.getElementById('app'))
```

Another difference is that it can also take a `HTMLTemplate` instance as target, allowing to render templates one after another.

```typescript
const items = [
    html`<li>Buy groceries</li>`,
    html`<li>Go to gym</li>`,
    html`<li>Write a blog</li>`,
]

html`<ul>
    ${items}
</ul>`.render(document.body)

html`<li>Read a book</li>`.insertAfter(items.at(-1))
```

#### parentNode

The `parentNode` property will tell you where the template was rendered. It will return the element in which the template nodes were added to.

#### mounted

After you render your template, you can use the `mounted` property to check if your template was added to the target as you wanted.

The `mounted` method will not tell you if the template is actually attached to a document. For that, you can use the `parentNode?.isConnected`.

```javascript
const temp1 = html`one`.render(document.createDocumentFragment())
const temp2 = html`two`.render(document.body)

console.log(
    temp1.mounted, // true
    temp1.parentNode?.isConnected // false
)

console.log(
    temp2.mounted, // true
    temp2.parentNode?.isConnected // true
)
```

#### childNodes

The `childNodes` will give you and array of top level Nodes rendered by the template.

```javascript
const temp = html`
    Loose text
    <p>a paragraph</p>
    <button>click me</button>
    ending
`.render(document.body)

console.log(temp.childNodes) // [text, p, text, button, text]
```

#### unmount

To remove your template from the target, you can use the `unmount` method.

```javascript
temp.unmount()
```

The `unmount` should be the only way you go about removing the template from the DOM. This is because it also unsubscribes from any state recursively. This means that even when you nest templates, the `unmount` will be called for all of them.

#### toString

Conveniently, you can get a string representation of your template in its current rendered state.

```javascript
const temp = html`
    Loose text
    <p>a paragraph</p>
    <button>click me</button>
    ending
`.render(document.body)

console.log(temp.toString())
/* 
Loose text
    <p>a paragraph</p>
    <button> click me</button>
    ending
 */
```

#### Livecycles

There are additional methods available for livecycles purpose. You can learn more by checking the [livecycles](./lifecycles.md) document.