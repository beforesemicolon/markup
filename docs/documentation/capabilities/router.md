---
name: Router
order: 4.4
title: Router - Markup by Before Semicolon
description: Web Component based Router with Markup by Before Semicolon
layout: document
---

## Router

Markup offers a Web Component based routing solution you can use to create powerful single and multi-page applications.

The best part is that it uses simple APIs and Web Component tags you can use to render content based on url details like pathname and search queries. You can use this routing solution via two ways:

-   [Web Components](#web-components): web component tags you can use around your content without having to use JavaScript.
-   [Routing APIs](#routing-apis): JavaScript API that supports web components which are a collection of function you can call to perform actions, react to changes, or get location metadata.

## Examples

```html
<!-- index.html -->

<nav>
    <!-- navigate with ability to update title and pass data via payload attribute -->
    <page-link path="/" title="Welcome" payload='{"heading": "Home content"}'
        >Home</page-link
    >
    <page-link path="/todos" search="tab=one" title="Manage todos"
        >Todos</page-link
    >
    <page-link path="/contact" title="Contact">Contact</page-link>
</nav>

<!-- wrap the content to render based on url pathname -->
<page-route path="/">
    <h1>
        <!-- render page metadata like specified payload, 
            path and search query param values -->
        <page-data key="heading"> Home content </page-data>
    </h1>
    <p>This is home content</p>

    <div class="tabs">
        <div class="tab-header">
            <!-- update search query -->
            <page-link search="tab=one">Tab 1</page-link>
            <page-link search="tab=two">Tab 2</page-link>
        </div>

        <div class="tab-content">
            <!-- render content base on specific search query values -->
            <page-route-query key="tab" value="one">
                Tab One content
            </page-route-query>

            <page-route-query key="tab" value="two">
                Tab Two content
            </page-route-query>
        </div>
    </div>

    <!-- choose to ALWAYS redirect to a default location when no url match -->
    <page-redirect type="always" path="/?tab=one"></page-redirect>
</page-route>

<!-- nest routes to create complex sitemap
    by allowing path to not be matched exactly (default) -->
<page-route path="/todos" exact="false">
    <!-- child routes are aware of their parent routes
        no matter where they are rendered
        and will always extend their parent paths -->
    <page-route src="./pages/todos.js"></page-route>

    <!-- use pathname params to specify variables in the pathname -->
    <page-route path="/:todoId" src="./pages/todo-item.js"></page-route>
</page-route>

<!-- load content from text, HTML, or JavaScript files -->
<page-route path="/contact" src="./pages/contact.js"></page-route>

<page-route path="/404"> 404 - Page not found! </page-route>

<!-- force redirect when pathnames are unknown -->
<page-redirect path="/404" title="404 - Page not found!"></page-redirect>
```

## Installation

via npm:

```
npm install @beforesemicolon/router
```

via yarn:

```
yarn add @beforesemicolon/router
```

via cdn:

```html
<!-- required WebComponent Markup to be present -->
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>

<!-- use the latest version -->
<script src="https://unpkg.com/@beforesemicolon/router/dist/client.js"></script>

<!-- use a specific version -->
<script src="https://unpkg.com/@beforesemicolon/router@1.0.0/dist/client.js"></script>
```

Access in JavaScript:

```javascript
const { ... } = BFS.ROUTER
```

## Web Components

Web components are perfect solution for routing as they can be used alongside your HTML content without ever needing to write a single line of JavaScript in order to define the routing of your application.

Another thing that makes web components a perfect solution is the fact that they can be used with any web framework to define your routing system.

You are provided with five web components to perform everything:

-   [Page route](#page-route): wrap or load content to render based on specified location pathname;
-   [Page route query](#page-route-query): wrap or load content to render based on specified location search query value;
-   [Page link](#page-link): create links to all known page routes or to modify specific search parameter;
-   [Page redirect](#page-redirect): redirect to known locations whenever the location is unknown;
-   [Page data](#page-data): render location metadata like state data, pathname or search query parameter value;

### Page route

The `page-route` component allows you to wrap or load content that you wish to render based on a specific pathname pattern match. It accepts the following attributes:

-   `path`: The [location](https://developer.mozilla.org/en-US/docs/Web/API/Location) `pathname` pattern the route should match.
-   `src`: The path to the text, HTML, or JavaScript file containing the content to render.
-   `exact`: Whether the path should be match exactly as specified or be open-ended. This defaults to `true`.
-   `title`: The new document title value for when the page renders. Overrides [page-link](#page-link) `title`.

By simply wrapping content with `page-route`, such content will be rendered only when the location pathname matches the `path` pattern.

```html
<page-route path="/"> Home content </page-route>
```

You may also specify pathname params that you access using the [page-data](#page-data) component or the [getPageParams](#getpageparams) utility.

```html
<page-route path="/todos/:todoId">
    <h2>Todo (<page-data param="todoId">unknown</page-data>)</h2>
</page-route>
```

When using the `src` you can specify a loading indicator or a fallback content in case something goes wrong with loading the file content using the [slot](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) attribute with name of `loading` or `fallback`.

```html
<page-route path="/contact" src="./contact.html">
    <div slot="loading">Loading...</div>
    <div slot="fallback">Oops - Failed to load content</div>
</page-route>
```

In case you specify a JavaScript file, this file will be imported using `import(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)` and must export default the following:

-   HTML string;
-   Any text;
-   A [Node](https://developer.mozilla.org/en-US/docs/Web/API/Node), including any derived object like HTMLElement, Element, DocumentFragment, etc;
-   A [HTMLTemplate](../templating/values.md#htmltemplate) instance using the Markup `html` template literal.
-   A function that is called with location state data, path params, and search query (in that order) and must return any of the above.

```html
<page-route path="/" src="./pages/home.js"></page-route>
```

Example with HTML string:

```javascript
// ./pages/home.js

export default `
    <h2>Welcome</h2>
`
```

Example with Node:

```javascript
// ./pages/home.js

const h2 = document.createElement('h2')
h2.textContent = 'Welcome'

export default h2
```

Example with HTML template:

```javascript
// ./pages/home.js

const { html } = BFS.MARKUP

const title = 'Welcome'

export default html` <h2>${title}</h2> `
```

Example with function:

```javascript
// ./pages/home.js

const { html } = BFS.MARKUP

// this function will get call on every render but this file is loaded once
// which mean you can declare things outside of this function that will
// remain the same between renders
export default (locationState, pathParams, searchQuery) => {
    return html` <h2>${locationState.title}</h2> `
}
```

Know that the `src` file is only loaded once and used between renders. When the `page-route` does not match the pathname everything is cleared and rendered next time there is a match.

This behavior ensures no memory leaks or increased memory usage although using function you can have things running in the background after the page route content is cleaned up. This can be something to take advantage off and keep some things running in the background to save some calculations the next time the page route content re-renders.

Additionally, any `page-route` that does not match with the location pathname will render with the `hidden` attribute ensuring everything is truly invisible for the user.

### Page route query

The `page-route-query` component allows you to wrap or load content that you wish to render based on a specific location search query value match. It accepts the following attributes:

-   `key`: The name of the search query property.
-   `value`: The value of the search query property.
-   `src`: The path to the text, HTML, or JavaScript file containing the content to render.

The `page-route-query` component works just like [page-route](#page-route).

```html
<page-route-query key="tab" value="contact" src="./contact.html">
    <div slot="loading">Loading...</div>
    <div slot="fallback">Oops - Failed to load content</div>
</page-route-query>
```

It supports all the loading and fallback slots, and can load content from a file as well.

This component makes it easy to render things based on search query values which is an amazing option to have dynamic pages without having to write any JavaScript to track state.

Here is an example of a simple tabs component using `page-route-query` along with [page-link](#page-link):

```html
<div class="tabs">
    <div class="tab-header">
        <page-link search="tab=one">Tab 1</page-link>
        <page-link search="tab=two">Tab 2</page-link>
    </div>

    <div class="tab-content">
        <page-route-query key="tab" value="one">
            Tab One content
        </page-route-query>

        <page-route-query key="tab" value="one">
            Tab Two content
        </page-route-query>
    </div>
</div>
```

### Page link

The `page-link` component allow you to navigate around targeting specific pathnames and search query values and it supports the following attributes:

-   `path`: The location `pathname` to navigate to;
-   `search`: The location `search` value to update the url with;
-   `keep-current-search`: Whether to keep current url search value when updating it with a new one. (Default: `False`);
-   `exact`: Controls whether the link is marked as active based on exact match of the current location pathname. (Default: `True`);
-   `title`: The new document title value for when the url changes;
-   `payload`: The location `state` value to pass to the new page and it must be an object literal;

```html
<page-link path="/" title="Welcome" payload='{"sample": "value"}'>
    Home Info
</page-link>
```

The amazing thing about `page-link` is that it understands the page where its rendered allowing you to use the location pathname as well as the `page-route` path value to create the `path` value.

-   No `path` attribute: leaving out the `path` attribute simply means to use the current location `pathname` which allows you to just specify the search value, for example:

```html
<page-link search="tab=one">Tab 1</page-link>
```

-   Prefixing `path` with `$` will be replaced with the closest `page-route` `path` attribute value allowing you to create links based on the page route where it was rendered. If one is not available, it will match the root pathname "/";

```html
<page-route path="/project/:projectId">
    <page-link path="$/summary">Summary</page-link>
    <!-- takes you to /project/PROJECT_ID_VALUE/summary  -->
</page-route>
```

-   Prefixing `path` with `~` will be replaced with whatever the current location pathname is;

```html
<page-link path="~/tags">Tags</page-link>
<!-- takes you to location.pathname + /tags -->
```

When it comes to the `search` attribute, you dont need it if you are specifying the `path` since you can add the search query in the `path` directly. Its only available for situations you want to use whatever location pathname and just want to update it with a search value;

Furthermore, you can choose to keep whatever current location search value is with `keep-current-search` attribute which is `false` by default;

```html
<page-link path="/?tab=one">Tab 1</page-link>
<!-- takes you to /?tab=one -->

<page-link search="tab=one">Tab 1</page-link>
<!-- takes you to location.pathname + tab=one -->

<page-link search="tab=one" keep-current-search="true">Tab 1</page-link>
<!-- takes you to location.pathname + location.search + tab=one -->
```

The `page-link` itself will gain the `active` attribute whenever the location matches the link `path` value.

You can control how the match is done by providing the `exact` attribute. By default, it will only mark the link as active with an exact match.

Let's say you have a link to a `/todos` page and you want to highlight the link for all the child page of `/todos` as well. To do that, just set `exact` to `false` and it will remain in active state as long as the URL pathname starts with `/todos`.

```html
<!--
location: /todos/94orisf7snrxiyin8n3kjdiu
-->

<!-- will not be in active state -->
<page-link path="/todos">Todos</page-link>

<!-- will be in active state -->
<page-link path="/todos" exact="false">Todos</page-link>
```

You may also use this attribute for styling the link accordingly.

```css
/* target its active state */
page-link[active] {
    ...
}
```

You can go even further and reach out inside the `page-link` tag to style the `a` tag to style according to its state.

```css
/* target the anchor tag inside */
page-link::part(anchor) {
    text-decoration: none;
    color: #444;
    padding: 10px;
    border-bottom: 2px solid transparent;
}

/* target the anchor tag inside when in the active state */
page-link[active]::part(anchor) {
    background: #b4fff8;
    border-color: #222;
    color: #000;
}

/* target the anchor tag inside different states */
page-link::part(anchor):visited { ... }
page-link::part(anchor):active { ... }
page-link::part(anchor):hover { ... }
```

### Page redirect

The `page-redirect` component allows you specify where to go in case no known page routes path are matched. It works just like [page-link](#page-link) pragmatic instead of event driven, therefore it supports the following attributes:

-   `type`: The type of redirection to make. The possible values are `unknown` (default) and `always`;
-   `path`: The location `pathname` to navigate to;
-   `title`: The new document title value for when the url changes;
-   `payload`: The location `state` value to pass to the new page and it must be an object literal;

The component is aware of where it is rendered so when adding it inside a `page-route` means it will only do page redirect for unknown child routes of such page route.

```html
<page-route path="/projects/:projectId">
    <!-- will only redirect if 
        any path starting with /projects/:projectId is unknown -->
    <page-redirect path="/projects/not-found"></page-redirect>
</page-route>
```

It is important to know that you should render the `page-redirect` after all `page-route` components so those routes are registered by the time the `page-redirect` gets rendered.

```html
<page-route pat="/">...</page-route>
<page-route pat="/about">...</page-route>
<page-route pat="/contact">...</page-route>
<page-route pat="/404">...</page-route>
<page-route path="/projects/:projectId">
    <!-- will only redirect if 
        any path starting with /project/:projectId is unknown -->
    <page-redirect path="/project/not-found"></page-redirect>
</page-route>

<!-- will only redirect unknown root level paths -->
<page-redirect path="/404"></page-redirect>
```

When it comes the the `type` of redirect, you have two options:

-   `unknown` (default): only redirects if the path is unknown
-   `always`: will always redirect to a specified location if the path matches the nearest `page-route` path or root ("/") exactly;

The `always` options comes handy when you have a parent route but also want a default child route content to be displayed:

```html
<page-route path="/projects/:projectId" exact="false">
    <h2>Welcome to Project (<page-data param="projectId"></page-data>)</h2>
    <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab blanditiis
        omnis possimus!
    </p>

    <div class="tabs">
        <div class="tabs-header">
            <page-link path="$/summary">Summary</page-link>
            <page-link path="$/summary">Stats</page-link>
            <page-link path="$/resources">Resources</page-link>
        </div>

        <div class="tabs-content">
            <page-route path="/summary">...</page-route>
            <page-route path="/stats">...</page-route>
            <page-route path="/resources">...</page-route>
        </div>
    </div>

    <!-- always redirect to summary when user navigates to /projects/:projectId 
        so the summary tab content can render -->
    <page-redirect path="$/summary" type="always"></page-redirect>
</page-route>
```

### Page data

The `page-data` components allows you to render the page metadata directly in the HTML and supports the following attributes:

-   `param`: Name of the location `pathname` param specified in the `page-route` `path` attribute;
-   `search-param`: The location `search` property you want the value of;
-   `key`: Name of the history `state` object property you want to access and can use dot-notation to access deep property values;

```html
<page-route path="/projects/:projectName/:projectId">
    <h2>
        <page-data param="projectName"></page-data>
    </h2>

    <p>Project ID is: <page-data param="projectId"></page-data></p>

    <p>Project object:</p>

    <!-- Will render a stringified version of the history.state object
     otherwise "No project loaded" if no state was identified -->
    <page-data>No project object received</page-data>
</page-route>
```

In case you want to read a specific property value that is deeplu nested, the `key` attribute allows you to do just that.

```html
<page-link
    path="/projects/my-project/123"
    payload='{"name": "my-project", "details": {"status": "pending"}}'
></page-link>
```

To read the project status from the example above, you can do:

```html
<page-data key="details.status">Unknown</page-data>
```

Anything you add inside the `page-data` tags will be used as fall back in case there is no data to show.

## Routing APIs

Additionally, the router itself exposes a collection of functions that support the [web components](#web-components) in what they do. Yoou can use these APIs to create your own solutions or extend the functionality of this library:

-   [onPageChange](#onpagechange): A function to subscribe to page changes whether they happened via link interactions or browser navigation.
-   [isOnPage](#isonpage): A function that tells you whether a provided location is the current location in the browser
-   [goToPage](#gotopage): A function to add a new entry to the browser history;
-   [previousPage](#previouspage): A function to go to the previous entry in the browser history;
-   [previousPage](#nextpage): A function to go to the next entry in the browser history;
-   [replacePage](#replacepage): A function to update location by replacing the last entry in the browser history;
-   [getPageParams](#getpageparams): A function to get any name location pathname parameter;
-   [getSearchParams](#getsearchparams): A function that gets you the search query as an object literal;
-   [getPageData](#getpagedata): A function that gets you the current history entry state data;
-   [registerRoute](#registerroute): A function that lets you register a location pathname pattern;
-   [isRegisteredRoute](#isregisteredroute): A function that lets you check if a specific location pathname is registered;
-   [parsePathname](#parsepathname): A function that given a location pathname pattern, will fill up the details from the current location pathname;

### onPageChange

The `onPageChange` function allows you to quickly subscribe to the page location changes by providing a callback function that gets called with:

-   `pathname`: the new location pathname;
-   `searchParams`: an object literal representation of the parsed location `search` value;
-   `pageData`: an object literal representing the history state value.

```javascript
onPageChange((pathname, searchParams, pageData) => {
    // react to the change
})
```

### isOnPage

The `isOnPage` utility is a powerful function to let you know if certain `pathname` is the current location in the browser. It takes the following arguments:

-   `pathname`: the new location pathname;
-   `exact`: whether to do an exact match check. When set to `false` child paths will also trigger the link to match and be active. (Default: `True`);

It will check for both `pathname` and `search` value of the current location. When the `exact` value is set to `false` it will check if the `pathname` and `search` starts with the current location values.

```javascript
// current location: /todos/94835jrijwirufft

isOnPage('/todos') // false
isOnPage('/todos', false) // true ('/todos/94835jrijwirufft' is a child page of '/todos')

isOnPage('/todos/94835jrijwirufft') // true
isOnPage('/todos/94835jrijwirufft', false) // true

isOnPage('/todos/94835jrijwirufft?sample=true') // false
isOnPage('/todos/94835jrijwirufft?sample=true', false) // false
```

Unless the `pathname` value you provide includes the `search` value, it will not use it to compare things. Also, the `search` value is checked left to right so, even if the search includes all the keys and exact values but you specify it in a different order it will still considered to not be a match.

```javascript
// current location: /sample/?page=one&tab=two

isOnPage('/sample') // true
isOnPage('/sample/?page=one&tab=two') // true
isOnPage('/sample/?page=one') // false
isOnPage('/sample/?page=one', false) // true
isOnPage('/sample/?tab=two&page=one') // false
isOnPage('/sample/?tab=two&page=one', false) // false
```

### goToPage

The `goToPage` function allows you to quickly add a new entry to the browser history while at the same time updating the page title and pass a new state data to the new location. It takes the following arguments:

-   `pathname`: the new location pathname;
-   `pageData`: an object literal representing the new history state value.
-   `title`: the new document title;

```javascript
goToPage(
    '/todos/123',
    {
        id: '123',
        name: 'Go to gym',
        status: 'pending',
    },
    'Todo: Go to gym'
)
goToPage('/404', {}, '404 - Page not found!')
```

### previousPage

The `previousPage` function simply takes you to the previous entry in the browser history. It is the equivalent of clicking the previous button in the browser;

```javascript
previousPage()
```

### nextPage

The `nextPage` function simply takes you to the next entry in the browser history. It is the equivalent of clicking the next button in the browser;

```javascript
nextPage()
```

### replacePage

The `replacePage` function allows you to quickly replace the current entry in the browser history while at the same time updating the page title and pass a new state data to the new location. It takes the following arguments:

-   `pathname`: the new location pathname;
-   `pageData`: an object literal representing the new history state value.
-   `title`: the new document title;

```javascript
replacePage(
    '/todos/123',
    {
        id: '123',
        name: 'Go to gym',
        status: 'pending',
    },
    'Todo: Go to gym'
)
replacePage('/404', {}, '404 - Page not found!')
```

### getPageParams

The `getPageParams` function will return an object literal with all current location pathname pattern defined parameters;

```javascript
// location pathname: /projects/my-project/283478brxedy7d87w84yr8
// location pathname pattern: /projects/:projectName/:projectId

getPageParams()
//  { projectName: 'my-project', projectId: '283478brxedy7d87w84yr8' }
```

### getSearchParams

The `getSearchParams` function will return an object literal of a parsed current location search query. This even mean it will parse JSON string values in the URL search;

```javascript
// location: /todo?name=go%20to%20gym&id=948us83w73nrynjd8dj49rwi&status=pending

getSearchParams()
//  { name: 'go to gym', id: '948us83w73nrynjd8dj49rwi', status: 'pending' }
```

### updateSearchQuery

The `updateSearchQuery` function will take an object literal to parse into a location search value or a `null` value to clear all the search. The location is replaced in place without adding a new entry to the browser history.

```javascript
// current location: /todo

updateSearchQuery({
    name: 'go to gym',
    id: '948us83w73nrynjd8dj49rwi',
    status: 'pending',
})

// new location: /todo?name=go%20to%20gym&id=948us83w73nrynjd8dj49rwi&status=pending

updateSearchQuery(null)

// new location: /todo
```

### getPageData

The `getPageData` function will return an object literal representation of the current history state value.

```javascript
goToPage(
    '/todos/123',
    {
        id: '123',
        name: 'Go to gym',
        status: 'pending',
    },
    'Todo: Go to gym'
)

getPageData()
// {
//    id: '123',
//    name: 'Go to gym',
//    status: 'pending'
// }
```

### registerRoute

The `registerRoute` function allows you to register a new location pathname pattern and specify whether the match should be exact or not. It accepts the following arguments:

-   `pattern`: the location pathname
-   `exact`: whether the match should be exact. Default: `True`;

```javascript
registerRoute('/')
registerRoute('/projects')
registerRoute('/projects/:projectName/:projectId', true)
```

### isRegisteredRoute

The `isRegisteredRoute` function allows you to check whether location pathname pattern has been already registered.

```javascript
isRegisteredRoute('/') // true
isRegisteredRoute('/projects') // true
isRegisteredRoute('/projects/:projectName/:projectId') // true

isRegisteredRoute('/404') // false
isRegisteredRoute('/about') // false
isRegisteredRoute('/projects/:projectName') // false
```

### parsePathname

The `parsePathname` function allows you to provide a location pathname pattern and it will use those parameters in the pattern replaced with the value in the current location.

```javascript
// location: /projects/my-project/283478brxedy7d87w84yr8

parsePathname('/projects/:projectId/:projectId/summary')
// /projects/my-project/283478brxedy7d87w84yr8/summary
```
