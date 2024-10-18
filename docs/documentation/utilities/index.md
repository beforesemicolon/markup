---
name: Introduction
order: 6
title: Utility - Markup by Before Semicolon
description: How Markup by Before Semicolon allows you to easily create DOM elements
layout: document
---

## Utilities

Markup offers many utility functions that aid you in templating or work with the DOM in general:

-   [element](./element.md): allows you to easily create DOM elements;
-   [suspense](./suspense.md): allows you to lazy render content;
-   [repeat](./repeat.md): allows you to handle lists or repeat content;
-   [when](./when.md): allows you to conditionally render content;
-   [is and isNot](./is-&-isnot.md): allows you to quickly check truthiness of states
-   [and, or, & oneOf](./and-or-&-oneof.md): allows you to quickly check conditions of states
-   [pick](./pick.md): allows you deeply read state object key values

### Why you need utilities?

In Markup, functions are first class citizens which means that reactive data are represented with functions. For simplicity you can create functions that handle specific logic away from the template so things look clean, and logic is reusable.

You can create utility functions to handle things like:

-   validation;
-   data transformation;
-   logic base rendering;
-   caching;
-   etc;

You only need to define utilities when working with states. Everything else can remain as static data.

Utilities are just functions that rendered in template and that need to be called whenever the state they depend on changes.

### Custom utility

The power with working with states and template comes when you start defining your own utilities. Let's look at a quick example:

We have a common scenario where we have a input field that uses state and we need to display a certain message whether the value is valid or not.

```javascript
const [value, updateValue] = state(null)

const handleChange = (event) => {
    updateValue(event.target.value)
}

html` <input value="${value}" oninput="${handleChange}" /> `.render(
    document.body
)
```

We could just go ahead and add the logic for the message right in template:

```javascript
html`
    <input value="${value}" onchange="${handleChange}" />
    ${() => {
        if (/[a-z]{3,}/i.test(value())) {
            return ''
        }

        return 'Value must me at least 3 characters'
    }}
`.render(document.body)
```

This is not bad but logic in the template takes space and lots of them makes template hard to read.

I realized that i want to mark the field red when the input is invalid and that relies on the same logic we have in the function. So, i can extract that logic into a function for reusability:

```javascript
const [value, updateValue] = state(null)

const isPristine = () => value() === null
const isValidValue = () => /[a-z]{3,}/i.test(value())

const handleChange = (event) => {
    updateValue(event.target.value)
}

html`
    <input value="${value}" oninput="${handleChange}" />
    ${isPristine} ${isValidValue}
`.render(document.body)
// renders: <input> true false
```

Now I have two utilities that tell me whether the value has ever been changed or if it is valid that I can use anywhere to render whatever.

But I don't need to stop there, i can use function to represent anything I want and end up with something like this:

```javascript
const [value, updateValue] = state(null)

const isPristine = () => value() === null
const isValidValue = () => /[a-z]{3,}/i.test(value())
const valueCSSColor = () => (or(isPristine, isValidValue)() ? 'inherit' : 'red')

const handleChange = (event) => {
    updateValue(event.target.value)
}

html`
    <input
        value="${value}"
        oninput="${handleChange}"
        style="color: ${valueCSSColor}"
    />
    ${when(
        or(isPristine, isValidValue),
        html`<p>Your name</p>`,
        html`<p style="color: ${valueCSSColor}">
            Name must be at least 3 characters
        </p>`
    )}
`.render(document.body)
```

You can see that we have functions that handle different logic composing them for even more complex logic dependent on the state.

This ability to just create and compose functions to handle everything is what further makes templating easy and fun in Markup.

We can further things up by wrapping everything in a reusable utility for handling form input values of any kind that we can use with multiple form fields.

```javascript
const formFieldValue = (pattern) => {
    const [value, updateValue] = state(null)

    const isPristine = () => value() === null
    const isValid = () => pattern.test(value())
    const isPristineOrValid = or(isPristine, isValid)
    const color = () => (isPristineOrValid() ? 'inherit' : 'red')

    return {
        value,
        updateValue,
        color,
        isPristine,
        isValid,
        isPristineOrValid,
    }
}
```

And this allows me to easily create fields handlers for any field like so:

```javascript
const name = formFieldValue(/[a-z]{3,}/i)
const email = formFieldValue(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)

const handleNameChange = (event) => {
    name.updateValue(event.target.value)
}

const handleEmailChange = (event) => {
    email.updateValue(event.target.value)
}

html`
    <input
        type="text"
        value="${name.value}"
        oninput="${handleNameChange}"
        style="color: ${name.color}"
    />
    ${when(
        name.isPristineOrValid,
        html`<p>Your name</p>`,
        html`<p style="color: ${name.color}">
            Name must be at least 3 characters
        </p>`
    )}

    <input
        type="email"
        value="${email.value}"
        oninput="${handleEmailChange}"
        style="color: ${email.color}"
    />
    ${when(
        email.isPristineOrValid,
        html`<p>Your email</p>`,
        html`<p style="color: ${email.color}">Email is not valid</p>`
    )}
`.render(document.body)
```

As you can see, when it comes to reactivity, Markup relies heavily and solely on functions to get the job done. This function oriented nature makes templating simple and somehow familiar to anyone. Give it a try!
