---
name: Markup
path: /
title: Markup by Before Semicolon
description: Reactive HTML Templating System to create Web User Interfaces.
layout: landing
---

<div role="banner" id="banner">

## Reactive Templating System

A simple and lightweight solution to create stateful Web User Interfaces.

<div class="actions">

[Documentation](documentation/index.md) [Get Started](documentation/get-started.md)

</div>

</div>

<section id="why-markup">

### Why Markup?

- **Reactive**
    Markup uses JavaScript template literals and Functions to allow you to create reative DOM with state management, render lyfecycles, and side effects controls.
- **Small**
    Markup allows you to do a lot with 9Kb compressed code (18Kb umcompressed). From prototyping to enterprise web applications, you can ship to the client confidently!
- **Simple**
    Markup is based on Web Standards and exposes 3 simple APIs you can use to enhance Web Components APIs, working with DOM, and building any Web User Interface.

</section>

<section id="reactive-dom">

#### Reactive DOM

Markup offers a standalone way to give reactivity to the DOM. By using template literals, you can define what the DOM should look like, and with functions and state, you can allow the DOM to change whenever a value does.

```javascript
const [count, updateCount] = state(0);

const button = document.createElement('button');

effect(() => {
  button.textContent = `count ${count()}`
})

button.onclick = () => {
  updateCount(prev => prev + 1)
}

document.body.appendChild(button);
```

</section>

<section id="enhance-web-components">

#### Enhance Web Components

Native Web Components APIs are powerful but still require DOM manipulation and state management. With Markup youu can continue to enjoy native web components with web standards while Markup handles all things DOM and state related.

```html
<input-field onchange="console.log(event.detail.value)"></input-field>
```

```javascript
class InputField extends WebComponent {
  static observedAttributes = ['value', 'type', 'placeholder'];
  type = 'text'
  value = ''
  placeholder = 'Enter text'
  
  handleChange = (e) => {
    this.dispatch('change', {
      value: e.target.value
    })
  }
  
  render() {
    return html`
      <input type="${this.props.type}" 
        value="${this.props.value}"
        placeholder="${this.props.placeholder}"
        oninput="${this.handleChange}"
        />`
  }
}

customElements.define('input-field', InputField)
```

</section>
