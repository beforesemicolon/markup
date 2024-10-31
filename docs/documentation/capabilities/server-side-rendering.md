---
name: Server Side Rendering
order: 7.6
title: Server Side Rendering - Markup by Before Semicolon
description: How to render markup templates on the server
layout: document
---

## Server Side Rendering

Markup can run in any JavaScript environment which means you can also server-side render the templates for your pages.

Take for example this simple page created with Markup.

```typescript
// ./server/pages/home.page.ts

import { html } from '@beforesemicolon/markup'

interface HomePageProps {
    title: string
}

export const HomePage = ({ title }: HomePageProps) => {
    return html`
        <!doctype html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <title>${title}</title>
            </head>
            <body>
                <h1>Hello World</h1>
            </body>
        </html>
    `
}
```

We can follow by creating a simple express app and serve our `HomePage`.

```typescript
// ./server/app.ts

import express, { Request, Response } from 'express'
import path from 'path'
import { HomePage } from './public/home.page.ts'

export const app = express()

app.get('/', (_req: Request, res: Response) => {
    res.send(
        HomePage({
            title: 'Welcome To The Page',
        }).toString()
    )
})

app.use(express.static(path.resolve(__dirname, 'public')))
```

Notice that we are calling the `.toString()` on the template which takes a snapshot of the current state of the template and returns a HTML string representation.

This also means that you can render templates on the server and take snapshots on updates to server-side render.

Now, we can serve our express app with Node like so:

```typescript
// ./server/index.ts

import('global-jsdom/register')
import http from 'http'
import { app } from './app.js'

const server = http.createServer(app)

server.listen(3000, () => {
    console.log('Server listening on http://localhost:3000/')
})
```

Notice that there is a `global-jsdom` package and all it does is make DOM APIs global that Markup can use to function normally. This is actually required for Node since Markup depend heavily on DOM APIs. Please find the right way to load DOM APIs depending on the JavaScript environment you use.

This is a simple example on how to approach rendering things on the server. The main requirement is to have some type of DOM API that can render on the server environment you use (Deno, Bun, Node, etc). From there, making such APIs globally available will cover everything, and you can use Markup freely.

[Try it Out](https://stackblitz.com/edit/stackblitz-starters-a6rvq7)
