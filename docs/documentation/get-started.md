---
name: '{{t.common.content.get_started}}'
order: 2
title: '{{t.pages.documentation.get_started.meta.get_started_with_markup_install_and_render_your_first_template}}'
description: '{{t.pages.documentation.get_started.meta.start_using_markup_with_a_simple_html_page_load_it_from_a_cdn_create_reactive_state_and_render_y}}'
layout: document
---

## {{t.common.content.get_started}}

{{t.pages.documentation.get_started.content.markup_is_a_plug_and_play_library_which_means_you_don_t_need_to_build_or_compile_it_into_anythin}}

{{t.pages.documentation.get_started.content.additionally_you_can_run_it_on_the_client_and_server_to_produce_any_type_of_application}}

### {{t.pages.documentation.get_started.content.try_examples_in_the_browser}}

{{t.pages.documentation.get_started.content.the_simplest_way_to_start_is_by_trying_it_in_browser_and_there_are_few_project_you_can_get_start}}

-   {{t.pages.documentation.get_started.content.client_todo_app_with_state_management_https_stackblitz_com_edit_web_platform_lvonxr_stackblitz}}
-   {{t.pages.documentation.get_started.content.client_counter_app_https_stackblitz_com_edit_web_platform_ixypdh_stackblitz}}
-   {{t.pages.documentation.get_started.content.client_timer_app_https_codepen_io_beforesemicolon_pen_ylqzqzv_codepen}}
-   {{t.pages.documentation.get_started.content.node_ssr_website_https_stackblitz_com_edit_stackblitz_starters_a6rvq7_stackblitz}}

### {{t.pages.documentation.get_started.content.html_file}}

{{t.pages.documentation.get_started.content.the_simplest_way_to_start_is_by_creating_an_html_file_and_adding_the_following_content_you_can_t}}

```html
<!doctype html>
<html lang="en">
    <head>
        <title>Markup - Hello World</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"></script>
    </head>
    <body>
        <div id="app"></div>

        <script>
            const { html, state } = BFS.MARKUP

            const [count, updateCount] = state(0)

            const countUp = () => {
                updateCount((prev) => prev + 1)
            }

            html`
                <h1>Hello World</h1>
                <button type="button" onclick="${countUp}">
                    count ${count}
                </button>
            `.render(document.getElementById('app'))
        </script>
    </body>
</html>
```
