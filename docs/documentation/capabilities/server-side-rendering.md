---
name: '{{t.pages.documentation.capabilities.server_side_rendering.meta.server_side_rendering}}'
order: 5.6
title: '{{t.pages.documentation.capabilities.server_side_rendering.meta.server_side_rendering_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.capabilities.server_side_rendering.meta.render_markup_templates_on_the_server_in_javascript_environments_serialize_html_output_and_under}}'
layout: document
---

## {{t.pages.documentation.capabilities.server_side_rendering.content.server_side_rendering}}

{{t.pages.documentation.capabilities.server_side_rendering.content.markup_can_run_in_any_javascript_environment_which_means_you_can_also_server_side_render_the_tem}}

{{t.pages.documentation.capabilities.server_side_rendering.content.take_for_example_this_simple_page_created_with_markup}}

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

{{t.pages.documentation.capabilities.server_side_rendering.content.we_can_follow_by_creating_a_simple_express_app_and_serve_our_homepage}}

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

{{t.pages.documentation.capabilities.server_side_rendering.content.notice_that_we_are_calling_the_tostring_on_the_template_which_takes_a_snapshot_of_the_current_st}}

{{t.pages.documentation.capabilities.server_side_rendering.content.this_also_means_that_you_can_render_templates_on_the_server_and_take_snapshots_on_updates_to_ser}}

{{t.pages.documentation.capabilities.server_side_rendering.content.now_we_can_serve_our_express_app_with_node_like_so}}

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

{{t.pages.documentation.capabilities.server_side_rendering.content.notice_that_there_is_a_global_jsdom_package_and_all_it_does_is_make_dom_apis_global_that_markup}}

{{t.pages.documentation.capabilities.server_side_rendering.content.this_is_a_simple_example_on_how_to_approach_rendering_things_on_the_server_the_main_requirement}}

{{t.pages.documentation.capabilities.server_side_rendering.content.try_it_out_https_stackblitz_com_edit_stackblitz_starters_a6rvq7}}
