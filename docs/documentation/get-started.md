---
name: Get Started
order: 2
title: Get Started - Markup by Before Semicolon
description: How to start using Markup by Before Semicolon
layout: document
---

## Get Started

Markup is a plug and play library, which means, you don't need to build or compile it into anything to be able to see what you build.

Additionally, you can run it on the client and server to produce any type of application.

### Try it in-Browser

The simplest way to start is by trying it in-browser, and we have set up few project you can get started with:

-   [Client ToDo App with State Management](https://stackblitz.com/edit/web-platform-lvonxr) (StackBlitz)
-   [Client Counter App](https://stackblitz.com/edit/web-platform-ixypdh) (StackBlitz)
-   [Client Timer App](https://codepen.io/beforesemicolon/pen/yLQzQZV) (CodePen)
-   [Node SSR website](https://stackblitz.com/edit/stackblitz-starters-a6rvq7) (StackBlitz)

### HTML File

The simplest way to start is by creating an html file and adding the following content. You can then open it in the browser to see.

```html
<!doctype html>
<html lang="en">
    <head>
        <title>Hello World</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"></script>
    </head>
    <body>
        <div id="app"></div>

        <script>
            const { html, state } = BFS.MARKUP

            html` <h1>Hello World</h1> `.render(document.getElementById('app'))
        </script>
    </body>
</html>
```
