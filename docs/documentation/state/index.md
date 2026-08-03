---
name: '{{t.pages.documentation.state.index.meta.intro_to_states}}'
order: 7
title: '{{t.pages.documentation.state.index.meta.state_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.state.index.meta.learn_markup_state_getter_setter_and_unsubscribe_behavior_for_reactive_rendering_direct_reads_fu}}'
layout: document
---

## {{t.pages.documentation.state.index.content.state}}

{{t.pages.documentation.state.index.content.something_that_is_truly_missing_in_web_apis_is_reactivity_the_ability_to_react_to_changes_instea}}

{{t.pages.documentation.state.index.content.until_then_markup_exposes_a_standalone_api_that_gives_you_that_capability_called_state}}

{{t.pages.documentation.state.index.content.the_state_api_can_be_used_with_or_without_templates_allowing_you_to_create_state_stores_capabili}}

```javascript
const [count, setCount] = state(0)

const btn = document.createElement('button')
btn.type = 'button'

btn.addEventListener('click', () => {
    setCount((prev) => prev + 1)
})

effect(() => {
    btn.textContent = `count: ${count()}`
})

document.body.append(btn)
```

{{t.pages.documentation.state.index.content.the_best_part_is_when_you_combine_state_and_templates_to_render_dom_nodes_that_react_to_updates}}

```javascript
const handleClick = () => {
    setCount((prev) => prev + 1)
}

html`<button type="button" onclick="${handleClick}">count: ${count}</button>`
```

{{t.pages.documentation.state.index.content.markup_templates_do_not_traverse_the_dom_to_check_for_updates_instead_it_creates_render_effects}}

### {{t.pages.documentation.state.index.content.input}}

{{t.pages.documentation.state.index.content.to_initialize_a_state_you_can_optionally_provide_an_initialvalue_as_well_as_a_statesubscriber_wh}}

```typescript
const [count] = state<number>(0, () => {
    // react to change
})
```

{{t.pages.documentation.state.index.content.when_no_input_value_provided_the_default_value_is_an_empty_string}}

### {{t.pages.documentation.state.index.content.return}}

{{t.pages.documentation.state.index.content.the_state_function_will_return_and_array_with_three_functions_a_stategetter_statesetter_and_a_st}}

```javascript
const [count, updateCount, unsubscribe] = state(0, () => {
    // will only get called once
})

updateCount(10)

unsubscribe()
```

#### {{t.pages.documentation.state.index.content.stategetter}}

{{t.pages.documentation.state.index.content.the_stategetter_is_a_function_you_must_call_to_get_the_current_value_of_the_state}}

```javascript
const [count] = state(0)

console.log(count()) // logs 0
```

#### {{t.pages.documentation.state.index.content.statesetter}}

{{t.pages.documentation.state.index.content.the_statesetter_is_a_function_you_call_with_the_new_value_for_the_state_or_a_function_that_gets}}

```javascript
const [count, updateCount] = state(0)

// provide a new value
updateCount(10)

// use current value and perform a calculation
updateCount(count() + 5)

// use the callback to update the value
updateCount((prev) => prev + 5)
```

{{t.pages.documentation.state.index.content.calling_the_statesetter_with_same_value_will_not_cause_the_subscribers_to_be_called_a_shallow_co}}

```javascript
const [count, updateCount] = state(0, () => {
    // this will never get called
    // given the setInterval update bellow
    console.log(count())
})

setInterval(() => {
    updateCount(0)
}, 1000)
```

#### {{t.pages.documentation.state.index.content.stateunsubscriber}}

{{t.pages.documentation.state.index.content.in_case_you_provide_a_statesubscriber_as_a_second_argument_for_the_state_you_can_then_use_the_st}}

```javascript
const [count, updateCount, unsubscribeFromCount] = state(0, () => {
    // react to change
})

unsubscribeFromCount()
```

### {{t.common.content.how_it_works}}

{{t.pages.documentation.state.index.content.the_state_is_a_synchronous_value_which_means_you_can_update_it_in_one_line_and_read_it_on_the_ne}}

```javascript
setCount(10)
console.log(count()) // logs 10
```

{{t.pages.documentation.state.index.content.behind_the_scenes_state_is_just_a_self_managed_subscription_that_works_seamlessly_with_effect_an}}

### {{t.common.content.examples}}

{{t.pages.documentation.state.index.content.form_input_value_and_validation}}

```javascript
const [valid, setValid] = state(true)
const [value, setValue] = state('', () => {
    if (value().length > 8) {
        setValid(false)
    }

    setValid(true)
})
```
