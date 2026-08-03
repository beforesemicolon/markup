---
name: '{{t.pages.documentation.utilities.suspense.meta.suspense}}'
order: 8.2
title: '{{t.pages.documentation.utilities.suspense.meta.suspense_utility_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.utilities.suspense.meta.use_the_markup_suspense_utility_to_render_async_content_with_loading_templates_error_templates_l}}'
layout: document
---

## {{t.pages.documentation.utilities.suspense.content.suspense_utility}}

{{t.pages.documentation.utilities.suspense.content.the_suspense_utility_allows_you_to_lazy_render_content_by_using_the_replace_templating_index_md}}

```javascript
const loadTodos = async () => {
    const res = await fetch('/api/todos')

    if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`)
    }

    const { result } = await res.json()

    return result.map((item) => html`<li>${item.name}</li>`)
}

html`<ul>
    ${suspense(loadTodos)}
</ul>`.render(document.body)
```

### {{t.pages.documentation.utilities.suspense.content.loading_state}}

{{t.pages.documentation.utilities.suspense.content.you_can_pass_a_custom_loading_content_to_render_while_the_asynchronous_work_is_being_performed_t}}

```javascript
html`<ul>
    ${suspense(loadTodos, html`<loading-spinner></loading-spinner>`)}
</ul>`.render(document.body)
```

### {{t.pages.documentation.utilities.suspense.content.error_state}}

{{t.pages.documentation.utilities.suspense.content.you_can_also_provide_a_function_as_third_argument_to_handle_how_you_want_to_display_any_errors_t}}

```javascript
html`<ul>
    ${suspense(
        loadTodos,
        html`<loading-spinner></loading-spinner>`,
        (error) => html`<error-display error="${error}"></error-display>`
    )}
</ul>`.render(document.body)
```
