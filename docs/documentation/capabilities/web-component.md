---
name: Web Component
order: 4.2
title: Web Component - Markup by Before Semicolon
description: Enhance Web Component APIs with Markup by Before Semicolon
layout: document
---

## Web Component

The [WebComponent](https://www.npmjs.com/package/@beforesemicolon/web-component) package is a Web Component version of Markup and its built on it as well.

The `WebComponent` is a single API that allows you to declare native web components enhanced with Markup with things like:

-   state management
-   props management
-   form experience enhancement
-   styling handling at component level
-   error handling in a single place
-   lifecycles
-   event handling
-   DOM node references

Here is a simple example of a `CounterApp` with all the main bells and whistles.

```typescript
import { WebComponent, html } from '@beforesemicolon/web-component'
import stylesheet from './counter-app.css' with { type: 'css' }

interface Props {
    label: string
}

interface State {
    count: number
}

class CounterApp extends WebComponent<Props, State> {
    static observedAttributes = ['label']
    label = '+' // defined props default value
    initialState = {
        // declare initial state
        count: 0,
    }
    // attach style at component level
    stylesheet = stylesheet

    countUp = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()

        this.setState(({ count }) => ({ count: count + 1 }))
        this.dispatch('click')
    }

    render() {
        return html`
            <p>${this.state.count}</p>
            <button type="button" onclick="${this.countUp}">
                ${this.props.label}
            </button>
        `
    }
}

// define components as you would natively
customElements.define('counter-app', CounterApp)
```

In your HTML, you can simply use the tag normally.

```html
<counter-app label="count up"></counter-app>
```

### Installation

Via npm:

```
npm install @beforesemicolon/web-component
```

Via yarn:

```
yarn add @beforesemicolon/web-component
```

Via CDN:

```html
<!-- use the latest version -->
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>

<!-- use a specific version -->
<script src="https://unpkg.com/@beforesemicolon/web-component@0.0.4/dist/client.js"></script>

<!-- link you app script after -->
<script>
    const { WebComponent } = BFS
    const { html, state } = BFS.MARKUP
</script>
```

### Create component

To create a component, all you need to do is create a class that extends WebComponent then define it.

```javascript
class MyButton extends WebComponent {}

customElements.define('my-button', MyButton)
```

### Config

You can configure very few basic things about your component that will determine how your component will be rendered.

#### ShadowRoot

By default, all components you create add a [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) in open mode.

If you don't want `ShadowRoot` in your components, you can set the `config.shadow` property to `false`.

```javascript
class MyButton extends WebComponent {
    config = {
        shadow: false,
    }
}

customElements.define('my-button', MyButton)
```

#### ShadowRoot options

You can specify any [attachShadow options](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options) in the config object, and they are all optional. The default matches their native default values.

```javascript
class MyButton extends WebComponent {
    config = {
        // whether to attach shadow root
        shadow: true,
        // shadow root options
        mode: 'open',
        delegatesFocus: false,
        clonable: false,
        serializable: false,
        slotAssignment: 'named',
    }
}

customElements.define('my-button', MyButton)
```

### Render

Not all components need an HTML body but in case you need one, you can use the `render` method to return either a [Markup template](../templating/index.md), a string, or a DOM element.

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class MyButton extends WebComponent {
    render() {
        return html`
            <button type="button">
                <slot></slot>
            </button>
        `
    }
}

customElements.define('my-button', MyButton)
```

In the render method, you can return anything: a string, a [DOM Node](https://developer.mozilla.org/en-US/docs/Web/API/Node), a [Markup template](../templating/index.md), a `null` value, or nothing at all. Some components can just handle some internal logic and don't need to render anything but their tags.

### Stylesheet

You have the ability to specify a style for your component either by providing a CSS string or a [CSSStyleSheet](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet).

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'
import buttonStyle from './my-button.css' with { type: 'css' }

class MyButton extends WebComponent {
    stylesheet = buttonStyle
}

customElements.define('my-button', MyButton)
```

Where the style is added will depend on whether the shadow option is true or false. If the component has a shadow style, it will be added to its own [content root](./web-component.md#content-root). Otherwise, style will be added to the closest root node in which the component was rendered. It can be the document itself or [root](./web-component.md#root) of an ancestor web component.

#### css

You can use the `css` utility to define your style inside the component as well.

```javascript
class MyButton extends WebComponent {
    stylesheet = css`
        :host {
            display: inline-block;
        }
        button {
            color: blue;
        }
    `
}

customElements.define('my-button', MyButton)
```

It helps your IDE give you better CSS syntax highlighting and autocompletion, but it does not perform any computation on your CSS at this point.

#### updateStylesheet

You can always manipulate the stylesheet property according to the `CSSStyleSheet` properties. For when you want to replace the stylesheet completely with another, you can use the `updateStylesheet` method and provide either a string or a new instance of `CSSStyleSheet`.

### Props

If your component expects props (inputs), you can set the `observedAttributes` static array with all the attribute names.

```javascript
class MyButton extends WebComponent {
    static observedAttributes = ['type', 'disabled', 'label']
}

customElements.define('my-button', MyButton)
```

To define the default values for your props, simply define a property in the class with the same name and provide the value.

```javascript
class MyButton extends WebComponent {
    static observedAttributes = ['type', 'disabled', 'label']
    type = 'button'
    disabled = false
    label = ''
}

customElements.define('my-button', MyButton)
```

To read your reactive props you can access the props property in the class. This is what it is recommended to be used in the template if you want the template to react to prop changes. Check the templating section for more.

```typescript
interface Props {
    type: 'button' | 'reset' | 'submit'
    disabled: boolean
    label: string
}

class MyButton extends WebComponent<Props, {}> {
    static observedAttributes = ['type', 'disabled', 'label']
    type = 'button'
    disabled = false
    label = ''

    constructor() {
        super()

        console.log(this.props) // contains all props as getter functions
        this.props.disabled() // will return the value
    }
}

customElements.define('my-button', MyButton)
```

### State

The state is based on [Markup state](../state/index.md), which means it will pair up with your template just fine.

#### initialState

To start using state in your component, simply define the initial state with the `initialState` property.

```typescript
interface State {
    loading: boolean
}

class MyButton extends WebComponent<{}, State> {
    initialState = {
        loading: false,
    }
}

customElements.define('my-button', MyButton)
```

#### setState

If you have a state, you will need to update it. To do that, you can call the `setState` method with a whole or partially new state object or simply a callback function that returns the state.

```typescript
interface State {
    loading: boolean
}

class MyButton extends WebComponent<{}, State> {
    initialState = {
        loading: false,
    }

    constructor() {
        super()

        this.setState({
            loading: true,
        })
    }
}

customElements.define('my-button', MyButton)
```

If you provide a partial state object, it will be merged with the current state object. No need to spread state when updating it.

You can also provide a callback so you can access the current state data.

```typescript
this.setState((prev) => ({
    loading: !prev.loading,
}))
```

### Events

Components can `dispatch` custom events of any name and include data. For that, you can use the dispatch method.

```javascript
class MyButton extends WebComponent {
    handleClick = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()

        this.dispatch('click')
    }

    render() {
        return html`
            <button type="button" onclick="${this.handleClick}">
                <slot></slot>
            </button>
        `
    }
}

customElements.define('my-button', MyButton)
```

This `dispatch` method also takes a second argument, which can be the data you want to expose with the event.

```javascript
this.dispatch('change', { value })
```

### Lifecycles

You could consider the constructor and render method as some type of "lifecycle" where anything inside the constructor happen when the component is instantiated and everything in the `render` method happens before the `onMount`.

#### onMount

The `onMount` method is called whenever the component is added to the DOM.

```javascript
class MyButton extends WebComponent {
    onMount() {
        console.log(this.mounted)
    }
}

customElements.define('my-button', MyButton)
```

You may always use the `mounted` property to check if the component is in the DOM or not.

You have the option to return a function to perform cleanups, which is executed like [onDestroy](./web-component.md#onDesctroy).

```javascript
class MyButton extends WebComponent {
    onMount() {
        return () => {
            // handle cleanup
        }
    }
}

customElements.define('my-button', MyButton)
```

#### onDestroy

The `onDestroy` method is called whenever the component is removed from the DOM.

```javascript
class MyButton extends WebComponent {
    onDestroy() {
        console.log(this.mounted)
    }
}

customElements.define('my-button', MyButton)
```

#### onUpdate

The `onUpdate` method is called whenever the component props are updated via the `setAttribute` or by changing the props property on the element instance directly.

```javascript
class MyButton extends WebComponent {
    onUpdate(name: string, newValue: unknown, oldValue: unknown) {
        console.log(`prop ${name} updated from ${oldValue} to ${newValue}`)
    }
}

customElements.define('my-button', MyButton)
```

The method will always tell you which prop and its new and old values.

#### onAdoption

The `onAdoption` method is called whenever the component is moved from one document to another. For example, when you move a component from an iframe to the main document.

```javascript
class MyButton extends WebComponent {
    onAdoption() {
        console.log(document)
    }
}

customElements.define('my-button', MyButton)
```

#### onError

The `onError` method is called whenever the component fails to perform internal actions. These actions can also be related to code executed inside any lifecycle methods, render, state or style update.

```javascript
class MyButton extends WebComponent {
    onError(error: Error) {
        console.log(document)
    }
}

customElements.define('my-button', MyButton)
```

You may also use this method as a single place to expose and handle all the errors.

```javascript
class MyButton extends WebComponent {
    onClick() {
        execAsyncAction().catch(this.onErrror)
    }

    onError(error) {
        // handle error
    }
}

customElements.define('my-button', MyButton)
```

You can also enhance components so that all errors are handled in the same place.

```javascript
// have your global componenent that extends WebComponent
// and that you can use to handle all global related things, for example, error tracking
class Component extends WebComponent {
    onError(error: Error) {
        trackError(error)
        console.error(error)
    }
}

class MyButton extends Component {
    onClick() {
        execAsyncAction().catch(this.onErrror)
    }
}

customElements.define('my-button', MyButton)
```

### Internals

WebComponent exposes the [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) via the readonly `internals` property that you can access for accessibility purposes.

To learn about how to create web components that well integrate with forms check the docs on [form controls](./form-controls.md).

```javascript
class TextField extends WebComponent {
    static formAssociated = true // add this to form-related components
    static observedAttributes = ['disabled', 'placeholder']
    disabled = false
    placeholder = ''

    render() {
        return html`
            <input
                type="text"
                placeholder="${this.props.placeholder}"
                disabled="${this.props.disabled}"
            />
        `
    }
}

const field = new TextField()

field.internals // ElementInternals object
```

### Content Root

WebComponent exposes the root of the component via the contentRoot property. If the component has a `shadowRoot`, it will expose it here regardless of the mode. If not, it will be the component itself.

```javascript
const field = new TextField()

field.contentRoot // ShadowRoot object
```

This is not to be confused with the Node returned by calling the [getRootNode()](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode) on an element. The getRootNode will return the element context root node, and contentRoot will contain the node where the template was rendered to.

### Root

The `root` tells you about where the component was rendered. It can either be the document itself or the ancestor element shadow root.
