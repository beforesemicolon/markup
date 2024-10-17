---
name: Attributes
order: 4.3
title: HTML Attributes - Markup by Before Semicolon
description: How to work with HTML attributes in Markup by Before Semicolon
layout: document
---

## HTML Attributes

HTML attributes in Markup templates work and look just like normal HTML attributes. One specific behavior change is related to [boolean attributes](https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML) and besides that, your knowledge about HTML attributes transfer as is.

### Boolean attributes

Boolean attributes in HTML are attributes that represent true or false values.

```javascript
html`
    <p hidden="false">hidden text</p>
    <button disabled>click me</button>
    <input type="checkbox" checked="false" />
`.render(document.body)
// <p hidden="false">hidden text</p>        <- still hidden
// <button disabled="">click me</button>
// <input type="checkbox" checked="false">  <- still checked
```

The issue with boolean attributes in HTML is that giving them the value of `false` does not stop their effect on the element. If they are present in the tag they work as having the value of `true`.

Markup honors the `true` or `false` values and allows you to add or remove these attributes just by specifying their boolean values.

```javascript
const hidden = false
const disabled = true
const checked = false

html`
    <p hidden="${hidden}">hidden text</p>
    <button disabled="${disabled}">click me</button>
    <input type="checkbox" checked="${checked}" />
`.render(document.body)
// <p>hidden text</p>
// <button disabled="true">click me</button>
// <input type="checkbox">
```

### Value attributes

Markup is aware of value you inject in the template as attribute values and will track and update them accordingly. There is no extra syntax necessary to make this happen.

```javascript
const type = 'button';
const active = 'active'
const style = 'color: white; background: black'

html`
    <button 
        type="${type}" 
        class="btn ${active} common" 
        style="border: none; ${style}"
        >click me</button>
`.render(document.body)
// <button type="button" class="btn active common" style="border: none; color: white; background: black">click me</button>
```

### Event attributes

HTML allows you to declare inline event attributes and they work the same with markup. No extra syntax is needed to add attach events but Markup does additional things in the background you can learn more about by reading the [events](./events.md) docs.

### Reference attribute

One thing that exists in Markup and not in HTML is the `ref` attribute that allows you to create a reference to an element you can use to access the rendered DOM element for whatever operation you need. You can read about [references](./ref.md) for more details.
