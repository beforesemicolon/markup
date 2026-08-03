---
name: '{{t.pages.documentation.utilities.pick.meta.pick}}'
order: 8.7
title: '{{t.pages.documentation.utilities.pick.meta.pick_utility_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.utilities.pick.meta.use_the_markup_pick_utility_to_select_deep_object_state_paths_while_preserving_reactivity_for_ne}}'
layout: document
---

## {{t.pages.documentation.utilities.pick.content.pick_utility}}

{{t.pages.documentation.utilities.pick.content.the_pick_utility_simplifies_working_with_object_states_by_allowing_you_to_read_deep_property_val}}

### {{t.pages.documentation.utilities.pick.content.why_use_pick_utility}}

{{t.pages.documentation.utilities.pick.content.let_s_look_at_a_simple_user_object_state}}

```javascript
const [currentUser] = state(null)
```

{{t.pages.documentation.utilities.pick.content.the_user_data_model_looks_something_like_this}}

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

{{t.pages.documentation.utilities.pick.content.now_we_can_try_to_display_this_user_information_that_was_set_in_the_state}}

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

{{t.pages.documentation.utilities.pick.content.this_displays_everything_perfectly_however_if_this_is_an_object_that_changes_nothing_will_re_ren}}

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

{{t.pages.documentation.utilities.pick.content.alternatively_you_can_use_pick_to_pick_the_properties_you_want_to_render_from_a_state}}

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

{{t.pages.documentation.utilities.pick.content.the_pick_utility_is_just_a_function_and_can_be_used_outside_the_templates_as_well}}

```javascript
console.log(pick(currentUser, 'jobs')())
```

### {{t.pages.documentation.utilities.pick.content.deep_values}}

{{t.pages.documentation.utilities.pick.content.the_best_part_of_using_pick_is_its_ability_to_let_you_pick_deep_values_for_example_let_s_access}}

```javascript
html`${pick(currentUser, 'jobs.2.company.website')}`
```

{{t.pages.documentation.utilities.pick.content.as_you_can_see_you_can_use_dot_notation_https_developer_mozilla_org_en_us_docs_web_javascript_re}}

### {{t.pages.documentation.utilities.pick.content.undefined_values}}

{{t.pages.documentation.utilities.pick.content.the_pick_utility_also_offers_protection_against_undefined_values_by_preventing_things_from_throw}}

{{t.pages.documentation.utilities.pick.content.the_pick_helper_will_catch_the_error_and_simply_returns_undefined_that_can_be_rendered_or_read_b}}

```javascript
html`${pick(currentUser, 'jobs.2.company.url')}`.render(document.body)
// renders "undefined"
```

### {{t.pages.documentation.utilities.pick.content.mapper_function}}

{{t.pages.documentation.utilities.pick.content.the_pick_utility_accepts_an_optional_third_argument_a_mapper_function_that_transforms_the_picked}}

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

{{t.pages.documentation.utilities.pick.content.this_is_useful_for_formatting_values_converting_types_or_applying_any_transformation_to_the_pick}}
