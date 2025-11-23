---
name: Pick
order: 7.7
title: Pick Utility - Markup by Before Semicolon
description: How to render deep state values in Markup by Before Semicolon
layout: document
---

## Pick Utility

The `pick` utility simplifies working with object states by allowing you to read deep property values while keeping the reactivity of the states.

### Why use `pick` utility?

Let's look at a simple user object state.

```javascript
const [currentUser] = state(null)
```

The user data model looks something like this:

```typescript
interface User {
    name: string
    emails: string[]
    skils: {
        name: string
        yearsOfExperience: number
    }[]
    type: 'Admin' | 'User' | 'Partner'
    jobs: {
        name: string
        startingDate: Date
        endDate?: Date
        company: {
            name: string
            website: string
            logo: string
        }
    }[]
}
```

Now we can try to display this user information that was set in the state.

```javascript
html`
    <h3>${currentUser().name}</h3>
    <p>email: ${currentUser().email}</h3>
    <h4>Skills:</h4>
    <ul>${repeat(currentUser().skills, renderSkil)}</ul>
    <h4>Jobs:</h4>
    <ul>${repeat(currentUser().jobs, renderJob)}</ul>
`.render(document.body)
```

This displays everything perfectly. However, if this is an object that changes, nothing will re-render because everything was rendered statically. The simple solution is to render everything dynamically using functions.

```javascript
html`
    <h3>${() => currentUser().name}</h3>
    <p>email: ${() => currentUser().email}</h3>
    <h4>Skills:</h4>
    <ul>${repeat(() => currentUser().skills, renderSkil)}</ul>
    <h4>Jobs:</h4>
    <ul>${repeat(() => currentUser().jobs, renderJob)}</ul>
`.render(document.body)
```

Alternatively, you can use `pick` to pick the properties you want to render from a state.

```javascript
html`
    <h3>${pick(currentUser, 'name')}</h3>
    <p>email: ${pick(currentUser, 'email')}</h3>
    <h4>Skills:</h4>
    <ul>${repeat(pick(currentUser, 'skills'), renderSkil)}</ul>
    <h4>Jobs:</h4>
    <ul>${repeat(pick(currentUser, 'jobs'), renderJob)}</ul>
`.render(document.body)
```

The `pick` utility is just a function and can be used outside the templates as well.

```javascript
console.log(pick(currentUser, 'jobs')())
```

### Deep values

The best part of using `pick` is its ability to let you pick deep values. For example, let's access our current user third job company website.

```javascript
html`${pick(currentUser, 'jobs.2.company.website')}`
```

As you can see, you can use [dot notation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors#dot_notation) to access properties deeply and everything will re-render when these values change.

### Undefined values

The `pick` utility also offers protection against undefined values by preventing things from throwing errors when trying to read a property that does not exist.

The `pick` helper will catch the error and simply returns `undefined` that can be rendered or read by your code.

```javascript
html`${pick(currentUser, 'jobs.2.company.url')}`.render(document.body)
// renders "undefined"
```

### Mapper function

The `pick` utility accepts an optional third argument - a mapper function that transforms the picked value before returning it.

```javascript
html`
    <h3>${pick(currentUser, 'name', (name) => name.toUpperCase())}</h3>
    <p>
        Member since:
        ${pick(currentUser, 'jobs.0.startingDate', (date) =>
            date.toLocaleDateString()
        )}
    </p>
`.render(document.body)
```

This is useful for formatting values, converting types, or applying any transformation to the picked value before it's rendered or used.
