---
name: Form Control
order: 4.3
title: Form Control - Markup by Before Semicolon
description: Form Control with Markup Web Component
layout: document
---

## Form Control

Markup exposes [WebComponent](./web-component.md) that allows you to create reactive web components with a simple API.

Another special capability of `WebComponent` is allow you to create form components that well integrate with [HTML Form](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form).

To illustrate that, lets look at a simple custom input field.

```javascript
class TextField extends WebComponent {
    // define the attributes the component should react to
    static observedAttributes = [
        'value',
        'placeholder',
        'pattern',
        'disabled',
        'required',
        'error',
    ]

    // define attributes default values
    placeholder = ''
    value = ''
    pattern = ''
    required = false
    disabled = false
    error = 'Invalid field value.'

    handleChange = (value) => {
        this.value = value
        // dispatch a change event with the input field value
        this.dispatch('change', { value })
    }

    // render the component content
    render() {
        const { error, ...inputAttrs } = this.props

        return html`
            <input
                ${inputAttrs}
                part="text-input"
                type="text"
                ref="input"
                onchange="${(event) => this.handleChange(event.target.value)}"
            />
        `
    }
}

// add your web component to the customElements registry
customElements.define('text-field', TextField)
```

With that we can render our custom text field inside a simple form with a reset and submit button.

```html
<form id="sample-form" method="POST">
    <text-field
        placeholder="Enter first name"
        name="firstName"
        pattern="[a-z]+"
        error="Invalid first name. May only contain letters and no space."
    ></text-field>
    <text-field
        placeholder="Enter last name"
        name="lastName"
        pattern="[a-z\s]+"
        error="Invalid last name. May only contain letters separated by space."
    ></text-field>
    <button type="reset">reset</button>
    <button type="submit">submit</button>
</form>
```

### The problem

Even though we have a custom text field for the form, it does not integrate well with the form, to illustrate that
let's handle a submit event on the form and see what the form sees.

```html
<!-- add a onsubmit event handler -->
<form id="sample-form" method="POST" onsubmit="handleSubmit(event)">...</form>
```

```javascript
// catch the submit event and read the form data
function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.target)

    // log form entries and fields of the form
    console.log(Object.fromEntries(formData), [...event.target])
}
```

When we click the `submit` button this is what we see:

```
{} (2) [button, button]
```

The form does not see the fields, just the buttons and consequently form entries is just an empty object. So let's fix that!

### formAssociated

The first thing we can do is tell HTML this element is should be associated with a form.

```javascript
class TextField extends WebComponent {
    ...

    // mark the component as form associated
    static formAssociated = true;

    ...
}
```

The [formAssociated](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals#examples) is not something related to Markup.
It is just native option for web components.

With this simple change, let's click the submit button again and look at the logs.

```
{} (4) [text-field, text-field, button, button]
```

As you can see now, the form sees our `text-field` web component. However, the form does not know about the value of these fields. Let's look at how we can fix that.

### internals

Markup `WebComponent` exposes [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) via the `internals` property you can use to communicate the value and validity state of your component.

To illustrate that, let's register the component value on mount.

```javascript
class TextField extends WebComponent {
    ...

    formAssociatedCallback(form) {
        // register value received from props
        this.internals.setFormValue(this.props.value(), false);
    }
}
```

With this change, we are registering our `TextField` value as soon as it gets notified that its been associated with a form. You can read about [formassociatedcallback](./form-controls.md#formassociatedcallback) when you look into [Form Lifecycles](./form-controls.md#form-lifecycles).

With that, let's click the `submit` button again an look at the logs.

```
{firstName: '', lastName: ''} (4) [text-field, text-field, button, button]
```

As you can see, the form data catches the properties `firstName` and `lastName` which are the name we gave to the `TextField` when we rendered them.

The [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) you access via `internals` property allows you to do more things like checking, setting, and reporting validity.

We can illustrate that by calling [setFormValue](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue) and [setValidity](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setValidity) whenever there is a value change right before we dispatch the `change` event.

```javascript
class TextField extends WebComponent {
    ...

    handleChange = (value, report = true) => {
        this.internals.setFormValue(value);
        this.value = value;

        const [inputField] = this.refs['input'];

        const validity = inputField.validity
        this.internals.setValidity(validity, validity.valid ? undefined : this.props.error(), inputField);
        report && this.internals.reportValidity();

        this.dispatch('change', {value});
    }

    ...
}
```

Above we are setting the value and grabbing the input field reference to get the validity state via the `validity` property. The validity changes depending on the value of the `required` and the `pattern` attributes.

You can learn more about [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) APIs you can explore to know how to enhance your components even more.

### Form Lifecycles

Markup `WebComponent` is like any native web components which means you can access the form callback lifecycles.

#### formAssociatedCallback

This lifecycle is called when the browser associates or disassociates the element with a form element.

For example, we can use this to call `setFormValue` to register the initial value that the component was rendered with.

```javascript
class TextField extends WebComponent {
    ...

    formAssociatedCallback(form) {
        this.handleChange(this.props.value(), false);
    }

    ...
}
```

#### formDisabledCallback

This lifecycle is called when:

-   The `disabled` attribute is added/removed from the component element
-   The `disabled` attribute is added/removed from a [fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset) the component is inside of.

We can use this to directly disable the input field and handle anything in our component that should put out component in a disabled mode.

```javascript
class TextField extends WebComponent {
    ...

    formDisabledCallback(disabled) {
        this.disabled = disabled;
    }

    ...
}
```

#### formResetCallback

This lifecycle is called when form is reset.

This can be illustrated by clicking the `reset` button in our form example. We can then go ahead reset out input field value along with any form field value and validity state.

```javascript
class TextField extends WebComponent {
    ...

    formResetCallback(form) {
        this.handleChange('', false)
    }

    ...
}
```

#### formStateRestoreCallback

This lifecycle is called in one of two circumstances:

-   When the browser restores the state of the element (for example, after a navigation, or when the browser restarts). The mode argument is "restore" in this case.
-   When the browser's input-assist features such as form auto-filling sets a value. The mode argument is "autocomplete" in this case.

We can use this in our `TextField` example to grab the value the form was restored with to update the form value and validity of our component.

```javascript
class TextField extends WebComponent {
    ...

    formStateRestoreCallback(state, mode) {
        if (mode == 'restore') {
            // expects a state parameter in the form 'controlMode/value'
            const [controlMode, value] = state.split('/');
            this.handleChange(value, false)
        }
    }

    ...
}
```

#### Full example

We can now see our `TextField` full code with additional improvements.

As you will see, it was not much to create our custom input field that we can use in any HTML form.

```javascript
class TextField extends WebComponent {
    static observedAttributes = [
        'value',
        'placeholder',
        'disabled',
        'pattern',
        'error',
        'required',
    ]
    static formAssociated = true

    stylesheet = `
        input {
          border: 1px solid #444;
          padding: 8px 10px;
          border-radius: 3px;
          min-width: 150px;
        }
        
        input:user-valid {
          border-color: #090;
        }
        
        input:user-invalid {
          border-color: #900;
        }
    `

    placeholder = ''
    value = ''
    pattern = ''
    disabled = false
    required = false
    error = 'Invalid field value'

    formAssociatedCallback(form) {
        this.handleChange(this.props.value(), false)
    }

    formDisabledCallback(disabled) {
        this.disabled = disabled
    }

    formResetCallback() {
        this.handleChange('', false)
    }

    formStateRestoreCallback(state, mode) {
        if (mode == 'restore') {
            const [controlMode, value] = state.split('/')
            this.handleChange(value, false)
        }
    }

    handleChange = (value, report = true) => {
        this.internals.setFormValue(value)
        this.value = value

        const [inputField] = this.refs['input']

        const validity = inputField.validity
        this.internals.setValidity(
            validity,
            validity.valid ? undefined : this.props.error(),
            inputField
        )
        report && this.internals.reportValidity()

        this.dispatch('change', { value })
    }

    render() {
        const { error, ...inputAttrs } = this.props

        return html`
            <input
                ${inputAttrs}
                part="text-input"
                type="text"
                ref="input"
                onchange="${(event) => this.handleChange(event.target.value)}"
            />
        `
    }
}

customElements.define('text-field', TextField)
```
