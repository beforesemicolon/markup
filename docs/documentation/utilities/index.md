---
name: '{{t.pages.documentation.utilities.index.meta.intro_to_utilities}}'
order: 8
title: '{{t.pages.documentation.utilities.index.meta.markup_utilities_conditional_async_repeated_and_lazy_rendering}}'
description: '{{t.pages.documentation.utilities.index.meta.overview_of_markup_helper_utilities_for_conditional_rendering_repeated_rendering_async_suspense}}'
layout: document
---

## {{t.pages.documentation.utilities.index.content.utilities}}

{{t.pages.documentation.utilities.index.content.markup_offers_many_utility_functions_that_aid_you_in_templating_or_work_with_the_dom_in_general}}

-   {{t.pages.documentation.utilities.index.content.element_element_md_allows_you_to_easily_create_dom_elements}}
-   {{t.pages.documentation.utilities.index.content.suspense_suspense_md_allows_you_to_lazy_render_content}}
-   {{t.pages.documentation.utilities.index.content.repeat_repeat_md_allows_you_to_handle_lists_or_repeat_content}}
-   {{t.pages.documentation.utilities.index.content.when_when_md_allows_you_to_conditionally_render_content}}
-   {{t.pages.documentation.utilities.index.content.visible_visible_md_allows_you_to_defer_rendering_until_elements_enter_viewport}}
-   {{t.pages.documentation.utilities.index.content.is_and_isnot_is_isnot_md_allows_you_to_quickly_check_truthiness_of_states}}
-   {{t.pages.documentation.utilities.index.content.and_or_oneof_and_or_oneof_md_allows_you_to_quickly_check_conditions_of_states}}
-   {{t.pages.documentation.utilities.index.content.pick_pick_md_allows_you_deeply_read_state_object_key_values}}

### {{t.pages.documentation.utilities.index.content.why_you_need_utilities}}

{{t.pages.documentation.utilities.index.content.in_markup_functions_are_first_class_citizens_which_means_that_reactive_data_are_represented_with}}

{{t.pages.documentation.utilities.index.content.you_can_create_utility_functions_to_handle_things_like}}

-   {{t.pages.documentation.utilities.index.content.validation}}
-   {{t.pages.documentation.utilities.index.content.data_transformation}}
-   {{t.pages.documentation.utilities.index.content.logic_base_rendering}}
-   {{t.pages.documentation.utilities.index.content.caching}}
-   {{t.pages.documentation.utilities.index.content.etc}}

{{t.pages.documentation.utilities.index.content.you_only_need_to_define_utilities_when_working_with_states_everything_else_can_remain_as_static}}

{{t.pages.documentation.utilities.index.content.utilities_are_just_functions_that_rendered_in_template_and_that_need_to_be_called_whenever_the_s}}

### {{t.pages.documentation.utilities.index.content.custom_utility}}

{{t.pages.documentation.utilities.index.content.the_power_with_working_with_states_and_template_comes_when_you_start_defining_your_own_utilities}}

{{t.pages.documentation.utilities.index.content.we_have_a_common_scenario_where_we_have_a_input_field_that_uses_state_and_we_need_to_display_a_c}}

```javascript
const [value, updateValue] = state(null)

const handleChange = (event) => {
    updateValue(event.target.value)
}

html` <input value="${value}" oninput="${handleChange}" /> `.render(
    document.body
)
```

{{t.pages.documentation.utilities.index.content.we_could_just_go_ahead_and_add_the_logic_for_the_message_right_in_template}}

```javascript
html`
    <input value="${value}" onchange="${handleChange}" />
    ${() => {
        if (/[a-z]{3,}/i.test(value())) {
            return ''
        }

        return 'Value must me at least 3 characters'
    }}
`.render(document.body)
```

{{t.pages.documentation.utilities.index.content.this_is_not_bad_but_logic_in_the_template_takes_space_and_lots_of_them_makes_template_hard_to_re}}

{{t.pages.documentation.utilities.index.content.i_realized_that_i_want_to_mark_the_field_red_when_the_input_is_invalid_and_that_relies_on_the_sa}}

```javascript
const [value, updateValue] = state(null)

const isPristine = () => value() === null
const isValidValue = () => /[a-z]{3,}/i.test(value())

const handleChange = (event) => {
    updateValue(event.target.value)
}

html`
    <input value="${value}" oninput="${handleChange}" />
    ${isPristine} ${isValidValue}
`.render(document.body)
// renders: <input> true false
```

{{t.pages.documentation.utilities.index.content.now_i_have_two_utilities_that_tell_me_whether_the_value_has_ever_been_changed_or_if_it_is_valid}}

{{t.pages.documentation.utilities.index.content.but_i_don_t_need_to_stop_there_i_can_use_function_to_represent_anything_i_want_and_end_up_with_s}}

```javascript
const [value, updateValue] = state(null)

const isPristine = () => value() === null
const isValidValue = () => /[a-z]{3,}/i.test(value())
const valueCSSColor = () => (or(isPristine, isValidValue)() ? 'inherit' : 'red')

const handleChange = (event) => {
    updateValue(event.target.value)
}

html`
    <input
        value="${value}"
        oninput="${handleChange}"
        style="color: ${valueCSSColor}"
    />
    ${when(
        or(isPristine, isValidValue),
        html`<p>Your name</p>`,
        html`<p style="color: ${valueCSSColor}">
            Name must be at least 3 characters
        </p>`
    )}
`.render(document.body)
```

{{t.pages.documentation.utilities.index.content.you_can_see_that_we_have_functions_that_handle_different_logic_composing_them_for_even_more_comp}}

{{t.pages.documentation.utilities.index.content.this_ability_to_just_create_and_compose_functions_to_handle_everything_is_what_further_makes_tem}}

{{t.pages.documentation.utilities.index.content.we_can_further_things_up_by_wrapping_everything_in_a_reusable_utility_for_handling_form_input_va}}

```javascript
const formFieldValue = (pattern) => {
    const [value, updateValue] = state(null)

    const isPristine = () => value() === null
    const isValid = () => pattern.test(value())
    const isPristineOrValid = or(isPristine, isValid)
    const color = () => (isPristineOrValid() ? 'inherit' : 'red')

    return {
        value,
        updateValue,
        color,
        isPristine,
        isValid,
        isPristineOrValid,
    }
}
```

{{t.pages.documentation.utilities.index.content.and_this_allows_me_to_easily_create_fields_handlers_for_any_field_like_so}}

```javascript
const name = formFieldValue(/[a-z]{3,}/i)
const email = formFieldValue(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)

const handleNameChange = (event) => {
    name.updateValue(event.target.value)
}

const handleEmailChange = (event) => {
    email.updateValue(event.target.value)
}

html`
    <input
        type="text"
        value="${name.value}"
        oninput="${handleNameChange}"
        style="color: ${name.color}"
    />
    ${when(
        name.isPristineOrValid,
        html`<p>Your name</p>`,
        html`<p style="color: ${name.color}">
            Name must be at least 3 characters
        </p>`
    )}

    <input
        type="email"
        value="${email.value}"
        oninput="${handleEmailChange}"
        style="color: ${email.color}"
    />
    ${when(
        email.isPristineOrValid,
        html`<p>Your email</p>`,
        html`<p style="color: ${email.color}">Email is not valid</p>`
    )}
`.render(document.body)
```

{{t.pages.documentation.utilities.index.content.as_you_can_see_when_it_comes_to_reactivity_markup_relies_heavily_and_solely_on_functions_to_get}}
