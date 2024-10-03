---
name: Markup Installation
path: /documentation/installation
title: Installation - Markup by Before Semicolon
description: Install Markup by Before Semicolon
layout: document
---

## Installation

Markup is a plug-and-play package that does not need to be built. There is no need to any additional setup or requirements to get started. Simply add it to your project and proceed.

### Via CDN

This method is the quickest loading option and can be placed in the head tag of the document.

```html
<script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js" />
```

You may also specify a specific version you want.

```html
<script src="https://unpkg.com/@beforesemicolon/markup@1.0.0/dist/client.js"/>
```

You can use various CDN providers like **unpkg**, **jsDelivr**.

```html
<script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"/>
<script src="https://cdn.jsdelivr.net/npm/@beforesemicolon/markup/dist/client.js"/>
```

The client CDN link will create a global BFS.MARKUP variable you can access for all the internal functions.

```javascript
const {html, state, effect} = BFS.MARKUP;
```

### Via npm

This package is also available via **npm** which will allow you to use it in server-side JavaScript environments.

```
npm install @beforesemicolon/markup
```

```javascript
import {html, state, effect} from "@beforesemicolon/markup";
```

### Via yarn

``` 
yarn add @beforesemicolon/markup
```

### Typescript

This package was built using typescript. You don't need to install a separate types package for it. All types are exported with it.
