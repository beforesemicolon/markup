# HTML String Renderer
A simple and small library that takes HTML string and parse it to DOM element while handling
all your DOM manipulation needs behind the scenes with efficient DOM updates on changes.

## Motivation
jQuery was a success when Browsers API were inconsistent and unreliable, but jQuery did not help with
organizing logic in a protected scope. That's why libraries like React, Angular, VueJs, etc became successful. 
They introduce the idea of components while handling all the DOM stuff behind the scenes.

However, they are all complex and introduce patterns which overcomplicate stuff. They are also incompatible with
each other which locks developers in an echo-system.

This library is about `3kb` when minimized and compressed and pack a punch by solving all your DOM needs.
It is ridiculous simple to use and depending on how you use it, it can mimic all popular libraries behavior
and features while being small, efficient, and simple.

Take a look at various examples to understand its power.

We encorage you to build whatever framework on top of this one as it handles the DOM for you!

## Examples

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
  // logic here
}

// tell it where to render this button
btn.render(document.body);
```

```js
// this simple time app is to mimic a component
// this pattern is not specific to this library, you are free to do whatever you like
const TimeApp = () => {
  let time = new Date();
  // this is the only API you need. Everything else is done for you
  let app = html`<p>${() => time.toLocaleString()}</p>`;
  
  let interval = setInterval(() => {
    if(app.nodes[0].isConnected) {
      time = new Date();
      // tell it when to update and it will only update
      // the part of the DOM which needs to reflect the data changes
      // that you made
      app.render(); 
    } else {
      clearInterval(interval);
    }
  }, 1000)
  
  return app;
}

TimeApp().render(document.body)
```

## Documentation

### html API
### HTMLRenderTemplate API
### Injected values
### Dynamic values
### The `ref` Attribute
### The `attr` Attribute
#### booleans
#### class
#### style
#### data
### Memoise elements
### The Component Pattern
