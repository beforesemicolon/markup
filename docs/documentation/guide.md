---
name: '{{t.pages.documentation.guide.meta.guide_best_practices}}'
order: 5
title: '{{t.pages.documentation.guide.meta.markup_guide_and_best_practices_javascript_reactive_ui}}'
description: '{{t.pages.documentation.guide.meta.comprehensive_markup_guide_covering_installation_html_templates_state_effects_utilities_webcompo}}'
layout: document
---

## {{t.pages.documentation.guide.content.guide_best_practices}}

{{t.pages.documentation.guide.content.this_guide_outlines_core_conventions_code_design_patterns_and_common_refactoring_workflows_for_w}}

---

## {{t.pages.documentation.guide.content.core_rules}}

1.  {{t.pages.documentation.guide.content.prefer_declarative_helpers_over_branching_avoid_writing_inline_javascript_ternary_operations_or}}
2.  {{t.pages.documentation.guide.content.keep_side_effects_out_of_render_functions_keep_template_rendering_strictly_side_effect_free_side}}
3.  {{t.pages.documentation.guide.content.state_immutability_do_not_mutate_objects_used_as_canonical_state_directly_track_derived_pending}}
4.  {{t.pages.documentation.guide.content.preserve_source_collections_keep_source_arrays_intact_when_deriving_filtered_or_sorted_views_cle}}
5.  {{t.pages.documentation.guide.content.reactive_value_binding_bind_props_and_state_directly_e_g_disabled_isdisabled_instead_of_disabled}}

---

## {{t.pages.documentation.guide.content.refactor_workflows}}

{{t.pages.documentation.guide.content.here_is_how_you_can_migrate_traditional_imperative_habits_into_clean_declarative_markup_code}}

### {{t.pages.documentation.guide.content.text_1_conditional_ui_if_else}}

{{t.pages.documentation.guide.content.avoid_writing_inline_javascript_conditions_or_logic_gates_inside_templates}}

{{t.pages.documentation.guide.content.imperative_avoid}}

```javascript
html`
    <div>
        ${() => (isLoading() ? html`<p>Loading...</p>` : html`<p>Loaded!</p>`)}
    </div>
`
```

{{t.pages.documentation.guide.content.declarative_prefer}}

```javascript
html`
    <div>${when(isLoading, html`<p>Loading...</p>`, html`<p>Loaded!</p>`)}</div>
`
```

{{t.pages.documentation.guide.content.you_can_use_ternary_directly_if_you_intend_to_render_once_and_or_dont_expect_the_data_update}}

```javascript
html` <div>${isLoading ? html`<p>Loading...</p>` : html`<p>Loaded!</p>`}</div> `
```

### {{t.pages.documentation.guide.content.text_2_rendering_lists}}

{{t.pages.documentation.guide.content.avoid_using_map_inside_templates_to_generate_dynamic_list_nodes_using_map_destroys_and_rebuilds}}

{{t.pages.documentation.guide.content.imperative_avoid}}

```javascript
html`
    <ul>
        ${() => items().map((item) => html`<li>${item.name}</li>`)}
    </ul>
`
```

{{t.pages.documentation.guide.content.declarative_prefer}}

```javascript
html`
    <ul>
        ${repeat(items, (item) => html`<li>${item.name}</li>`)}
    </ul>
`
```

{{t.pages.documentation.guide.content.you_can_use_the_map_directly_if_you_intend_to_render_once_and_or_dont_expect_updates}}

```javascript
html`
    <ul>
        ${list.map((item) => html`<li>${item.name}</li>`)}
    </ul>
`
```

### {{t.pages.documentation.guide.content.text_3_nested_optional_reads}}

{{t.pages.documentation.guide.content.avoid_using_nested_optional_chaining_directly_inside_ui_interpolations_this_can_lead_to_runtime}}

{{t.pages.documentation.guide.content.imperative_avoid}}

```javascript
html`
    <div>
        <h2>${() => user()?.profile?.details?.name || 'Guest'}</h2>
    </div>
`
```

{{t.pages.documentation.guide.content.declarative_prefer}}

```javascript
html`
    <div>
        <h2>
            ${pick(user, 'profile.details.name', (name) => name || 'Guest')}
        </h2>
    </div>
`
```

{{t.pages.documentation.guide.content.the_pick_option_allows_you_to_define_fallbacks_or_handle_the_value_for_formatting_and_or_additio}}

```javascript
const over18 = (age) => (age > 18 ? 'Over 18' : 'Under 18')

html`
    <div>
        <h2>${pick(user, 'profile.details.age', over18)}</h2>
    </div>
`
```

### {{t.pages.documentation.guide.content.text_4_boolean_expression_composition}}

{{t.pages.documentation.guide.content.avoid_writing_custom_functions_that_just_combine_multiple_states_with_or_compose_them_using_mark}}

{{t.pages.documentation.guide.content.imperative_avoid}}

```javascript
const canPublish = () => !isSaving() && hasChanges() && hasPermission()

html` <button disabled="${() => !canPublish()}">Publish</button> `
```

{{t.pages.documentation.guide.content.declarative_prefer}}

```javascript
const canPublish = and(isNot(isSaving), is(hasChanges), is(hasPermission))

html` <button disabled="${isNot(canPublish)}">Publish</button> `
```

{{t.pages.documentation.guide.content.markup_invites_function_compososition_and_working_with_stateful_functions_you_should_look_more_i}}

---

## {{t.pages.documentation.guide.content.canonical_patterns}}

### {{t.pages.documentation.guide.content.stateful_search_filter_listing}}

{{t.pages.documentation.guide.content.this_is_the_standard_pattern_for_rendering_collections_with_dynamic_filtering_the_source_state_i}}

```typescript
import { html, state, when, repeat, is, pick } from '@beforesemicolon/markup'

const [query, setQuery] = state('')
const [items] = state<Project[]>([])

// Derive filtered list reactively
const filtered = () =>
    items().filter((p) => p.name.toLowerCase().includes(query().toLowerCase()))

const handleInput = (event: Event) => {
    setQuery((event.target as HTMLInputElement).value)
}

const View = html`
    <input value="${query}" oninput="${handleInput}" />
    <ul>
        ${repeat(
            filtered,
            (item) => html`<li>${item.name}</li>`,
            () => html`<p>No results found.</p>`
        )}
    </ul>
`
```

{{t.pages.documentation.guide.content.this_allows_state_to_remain_immutable_and_you_to_create_derived_states_that_you_use_for_renderin}}

### {{t.pages.documentation.guide.content.async_slots_suspense}}

{{t.pages.documentation.guide.content.use_suspense_to_render_async_ui_cleanly_with_error_and_fallback_while_loading_rendering_handlers}}

```typescript
import { html, suspense } from '@beforesemicolon/markup'

const resource = async () => {
    const res = await fetch('/api/data')

    const data = await res.json()

    return html`<p>Resolved: ${data.message}</p>`
}

const ResourceView = html`
    ${suspense(
        resource,
        html`<p>Loading resource...</p>`,
        (err) => html`<p class="error">Error: ${err.message}</p>`
    )}
`
```

### {{t.pages.documentation.guide.content.more_common_patterns}}

{{t.pages.documentation.guide.content.here_are_more_typical_recipes_you_can_copy_paste_for_common_ui_requirements}}

#### {{t.pages.documentation.guide.content.membership_checks_option_swapping}}

```typescript
import { html, state, when, oneOf } from '@beforesemicolon/markup'

const [mode, setMode] = state<'view' | 'edit' | 'preview'>('view')

const View = html`
    ${when(
        oneOf(mode, ['edit', 'preview']),
        html`<button onclick="${() => setMode('view')}">Done</button>`,
        html`<button onclick="${() => setMode('edit')}">Edit</button>`
    )}
`
```

#### {{t.pages.documentation.guide.content.reactive_css_variables_styles}}

```typescript
import { html, state } from '@beforesemicolon/markup'

const [gap] = state(12)

// Reactive style bindings cleared and updated dynamically
const Box = html`
    <div style="--gap: ${() => `${gap()}px`}; margin: ${gap}px">
        Spacing Gap: ${gap}px
    </div>
`
```

#### {{t.pages.documentation.guide.content.nested_value_rendering}}

```typescript
import { html, state, pick } from '@beforesemicolon/markup'

const [currentEntity] = state({ details: { author: { name: 'Ada Lovelace' } } })

// Safe nested navigation via pick
const AuthorHeader = html`
    <h1>Written by: ${pick(currentEntity, 'details.author.name')}</h1>
`
```

#### {{t.pages.documentation.guide.content.shared_state_store}}

```typescript
import { state } from '@beforesemicolon/markup'

export const [todos, setTodos] = state<Todo[]>([])
export const [loadingState, setLoadingState] = state<
    'idle' | 'loading' | 'error'
>('idle')

export const fetchTodos = async () => {
    setLoadingState('loading')
    try {
        const response = await fetch('/api/todos')
        const list = await response.json()
        setTodos(list)
        setLoadingState('idle')
    } catch {
        setLoadingState('error')
    }
}
```

---

## {{t.pages.documentation.guide.content.conventions_guardrails}}

-   {{t.pages.documentation.guide.content.pass_getters_functions_directly_do_not_execute_getters_inside_template_attributes_when_subscript}}
-   {{t.pages.documentation.guide.content.clean_event_bindings_do_not_wrap_callbacks_in_redundant_closures_unless_passing_arguments}}
    -   {{t.pages.documentation.guide.content.good_logout}}
    -   {{t.pages.documentation.guide.content.good_handleselect_item_select}}
    -   {{t.pages.documentation.guide.content.avoid_logout_logout}}
-   {{t.pages.documentation.guide.content.direct_property_bindings_do_not_pre_normalize_simple_template_attributes_in_setup_getters_just_t}}
-   {{t.pages.documentation.guide.content.boolean_attributes_markup_core_automatically_unwraps_and_evaluates_boolean_states_do_not_add_boo}}
-   {{t.pages.documentation.guide.content.static_vs_reactive_if_a_value_is_static_never_changes_after_initialization_render_its_evaluated}}
