---
name: Introduction
order: 4
title: Render Template - Markup by Before Semicolon
description: How to create and render a templates in Markup by Before Semicolon
layout: document
---

## Template

Markup uses [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) called `html` to describe the HTML you want to render.

```javascript
const temp = html`<h1>Hello World</h1>`;
```

The `html` returns an `HTMLTemplate` instance containing methods and properties you can use to access or perform many actions.

### Rendering

There are few ways to render a template after you define it:

- `render`: Takes a DOM element to append the template to;
- `replace`: Takes a DOM element or another HTML template to replace in the DOM;
- `insertAfter`: Takes a DOM element to insert the template after;
