---
name: Markup Function Component
path: /documentation/capabilities/function-component
title: Function Component - Markup by Before Semicolon
description: How to create Component using Functions
layout: document
---

## Function Component

Markup does not ship with a dedicated component API. Components are simply functions that return a `HTMLTemplate` instance.

```javascript
const MyButton = () => {
  return html`
    <button type="button">
      click me
    </button>
  `;
}
```

It is totally up to you what these functions can do or look like. From the example above, you can simply render your component using the `render` method.

```javascript
MyButton().render(document.body)
```

### Inputs (Props)

Since its functions, you can take arguments and inject them directly into the template with proper defaults handling.

```javascript
const Button = ({
  content = "", 
  disabled = false, 
  type = "button"
}) => {
  return html`
    <button 
      type="${type}"
      disabled="${disabled}"
      >
      ${content}
    </button>`;
}
```

Templates can take raw values or functions that returns some value which can be a `state` or simply a `dynamic value`, in that case, you can have your input type definition use the `StateGetter` type.

```typescript
enum MyButtonType {
    Button = 'button',
    Reset = 'reset',
    Submit = 'submit'
}

interface MyButtonProps {
    content: unknown;
    disabled: boolean | StateGetter<boolean>
    type: MyButtonType | StateGetter<MyButtonType>
}
```

The `StateGetter` allows you to communicate that your component takes function values as input which makes it easier to work with states.

### Lifecycles

You can take advantage of both [effect](../state/effect.md) and `html` [lifecycles](../templating/lifecycles.md) to react to things like component mounted, unmounted, and updates to do everything you need.

```javascript
const ChatMessages = () => {
    const [messages, updateMessages] = state([])
    
    onUpdate(() => {
        // todo: scroll to the bottom to show latest msg
    })
    
    const onMount = () => {
        const controller = new AbortController();
        const signal = controller.signal;
        
        fetch('...', { signal })
            .then((res) => {
                if(!res.ok) throw new Error(res.statusText)
                
                return res.json()
            })
            .then((res) => updateMessages(res.messages))
            .catch(console.error);
        
        // return a function to be called on unmount
        // where you can perform any clean ups
        return () => {
            controller.abort();
        }
    }
    
    return html`
        <ul>
            ${repeat(messages, msg => html`<li>${msg}</li>
        </ul>
    `)}
        .onMount(onMount)
        .onUpdate(onUpdate)
}
```

Markup template has powerful lifecycles and because a function is called once and with power of reactivity, you can encapsulate everything inside the function leaving everything to Markup to manage.
