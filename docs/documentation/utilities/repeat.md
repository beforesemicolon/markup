---
name: '{{t.pages.documentation.utilities.repeat.meta.repeat}}'
order: 8.4
title: '{{t.pages.documentation.utilities.repeat.meta.repeat_utility_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.utilities.repeat.meta.render_lists_with_the_markup_repeat_utility_including_arrays_sets_maps_objects_numeric_ranges_em}}'
layout: document
---

## {{t.pages.documentation.utilities.repeat.content.repeat_utility}}

{{t.pages.documentation.utilities.repeat.content.the_repeat_utility_is_markup_recommended_way_to_render_iterable_data_or_repeating_content_it_han}}

```javascript
html`${repeat(todos, renderTodo)}`
```

### {{t.pages.documentation.utilities.repeat.content.why_use_repeat}}

{{t.pages.documentation.utilities.repeat.content.markup_templates_already_handle_arrays_but_like_any_other_injected_value_markup_track_the_whole}}

```javascript
const [todos, updateTodos] = state([])

html`${() => todos().map(renderTodo)}`.render(document.body)

updateTodos((prev) => [
    ...prev,
    {
        name: 'Go to gym',
        status: 'pending',
    },
])
```

{{t.pages.documentation.utilities.repeat.content.the_above_code_will_work_just_fine_as_far_as_rendering_a_list_the_issue_becomes_evident_when_a_s}}

{{t.pages.documentation.utilities.repeat.content.the_better_way_is_to_not_dynamically_map_the_list_on_render_but_on_creation_so_markup_always_hav}}

```javascript
const [todos, updateTodos] = state([])

html`${todos}`.render(document.body)

updateTodos((prev) => [
    ...prev,
    renderTodo({
        name: 'Go to gym',
        status: 'pending',
    }),
])
```

{{t.pages.documentation.utilities.repeat.content.this_is_exactly_what_repeat_utility_does_for_you_by_just_taking_the_data_and_the_render_function}}

### {{t.pages.documentation.utilities.repeat.content.numbers}}

{{t.pages.documentation.utilities.repeat.content.the_repeat_helper_accepts_a_number_among_many_things_this_number_represents_the_number_of_times}}

```javascript
html`${repeat(3, html`<spa></span>`)}`
```

{{t.pages.documentation.utilities.repeat.content.the_callback_function_will_be_called_with_numbers_from_1_to_the_number_you_provided_along_with_t}}

```javascript
html`${repeat(3, (n, index) => html`<spa>${n} - ${index}</span>`)}`.render(
    document.body
)
// <span>1 - 0</span><span>2 - 1</span><span>3 - 2</span>
```

### {{t.pages.documentation.utilities.repeat.content.iterables_and_object_literals}}

{{t.pages.documentation.utilities.repeat.content.additionally_repeat_can_consume_any_object_literal_or_iterable_object_https_developer_mozilla_or}}

-   {{t.pages.documentation.utilities.repeat.content.array}}
-   {{t.pages.documentation.utilities.repeat.content.set}}
-   {{t.pages.documentation.utilities.repeat.content.map}}
-   {{t.pages.documentation.utilities.repeat.content.string}}
-   {{t.pages.documentation.utilities.repeat.content.any_object_with_symbol_iterator_https_developer_mozilla_org_en_us_docs_web_javascript_reference}}

```javascript
const iterable = {}

iterable[Symbol.iterator] = function* () {
    yield 1
    yield 2
    yield 3
}

html`${repeat(iterable, renderItem)}`
```

{{t.pages.documentation.utilities.repeat.content.since_markup_template_do_not_handle_rendering_such_objects_except_array_this_is_an_additional_ad}}

{{t.pages.documentation.utilities.repeat.content.the_callback_function_will_always_get_called_with_the_entries_and_the_index}}

```javascript
const employeesSalary = {
    'john doe': 30000,
    'jane doe': 54000,
}

html`${repeat(employeesSalary, ([name, salary], index) => html`...`)}`
```

### {{t.pages.documentation.utilities.repeat.content.empty_state}}

{{t.pages.documentation.utilities.repeat.content.the_repeat_also_consumes_an_optional_third_argument_which_is_a_function_that_will_get_called_to}}

```javascript
html`${repeat(todos, renderTodo, () => html`<p>No todos yet!</p>`)}`
```

### {{t.pages.documentation.utilities.repeat.content.keys_and_options}}

{{t.pages.documentation.utilities.repeat.content.by_default_repeat_uses_the_list_items_themselves_as_identity_keys_to_track_updates_if_your_items}}

```javascript
const options = {
    key: (todo, index) => todo.id,
    empty: () => html`<p>No todos yet!</p>`,
}

html`${repeat(todos, renderTodo, options)}`
```

{{t.pages.documentation.utilities.repeat.content.the_options_object_supports_the_following_properties}}

-   {{t.pages.documentation.utilities.repeat.content.key_function_a_selector_function_that_returns_a_unique_key_for_each_item_highly_recommended_for}}
-   {{t.pages.documentation.utilities.repeat.content.empty_function_a_function_returning_the_template_or_node_to_render_when_the_collection_is_empty}}

### {{t.pages.documentation.utilities.repeat.content.lazy_list_rendering}}

{{t.pages.documentation.utilities.repeat.content.to_optimize_lists_with_a_large_number_of_complex_items_you_can_combine_the_repeat_utility_with_t}}

```javascript
import { html, repeat, visible } from '@beforesemicolon/markup'

html`
    <ul>
        ${repeat(
            todos,
            (todo, index) =>
                visible(
                    () => html`<todo-item item="${todo}"></todo-item>`,
                    html`<li class="placeholder">Loading...</li>`,
                    { eager: index < 10 } // render first 10 immediately
                ),
            { key: (todo) => todo.id }
        )}
    </ul>
`
```
