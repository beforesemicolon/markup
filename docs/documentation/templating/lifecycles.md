---
name: '{{t.common.content.lifecycles}}'
order: 6.1
title: '{{t.pages.documentation.templating.lifecycles.meta.template_lifecycles_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.templating.lifecycles.meta.use_markup_template_lifecycle_hooks_such_as_onmount_and_onupdate_to_run_setup_cleanup_and_side_e}}'
layout: document
---

## {{t.common.content.lifecycles}}

{{t.pages.documentation.templating.lifecycles.content.markup_exposes_few_methods_you_can_use_to_tap_into_the_lifecycles_of_the_template}}

-   {{t.pages.documentation.templating.lifecycles.content.onmount_method_that_takes_a_function_to_call_when_the_template_is_mounted_that_can_return_anothe}}
-   {{t.pages.documentation.templating.lifecycles.content.onupdate_method_that_takes_a_function_to_call_when_something_in_the_rendered_template_changes}}
-   {{t.pages.documentation.templating.lifecycles.content.onmove_method_that_takes_a_function_to_call_when_the_template_content_is_moved_from_one_location}}

{{t.pages.documentation.templating.lifecycles.content.all_lifecycle_callbacks_will_be_called_with_the_instance_of_the_template_as_the_first_argument_t}}

### {{t.pages.documentation.templating.lifecycles.content.onmount}}

{{t.pages.documentation.templating.lifecycles.content.the_onmount_method_takes_a_function_to_be_called_when_the_template_is_rendered_via_any_of_the_re}}

```javascript
const temp = html`<h1>Hello World</h1>`

temp.onMount(() => {
    // handle mount
    console.log('mounted')

    return () => {
        // handle unmount
        console.log('unmounted')
    }
})

temp.render(document.body) // triggers mount

temp.unmount() // trigger unmount
```

{{t.pages.documentation.templating.lifecycles.content.the_unmount_event_can_be_triggered_by_calling_the_unmount_or_when_the_template_was_removed_part}}

{{t.pages.documentation.templating.lifecycles.content.these_livecycles_are_perfect_for_setups_and_cleanups_around_the_template_these_are_things_like_w}}

```javascript
const [count, setCount] = state(0)

const temp = html`<p>${count}</p>`

temp.onMount(() => {
    let interval = setInterval(() => {
        setCount((prev) => prev + 1)
    }, 1000)

    return () => {
        clearInterval(interval)
    }
})

temp.render(document.body)

setTimeout(() => {
    temp.unmount()
}, 10000)
```

### {{t.pages.documentation.templating.lifecycles.content.onupdate}}

{{t.pages.documentation.templating.lifecycles.content.the_onupdate_method_takes_a_function_to_be_called_whenever_something_in_the_template_changes_thi}}

```javascript
const [count, updateCount] = state(0)

const temp = html`<p>${count}</p>`

temp.onUpdate(() => {
    console.log(temp.toString())
    // prints: "<p>10</p>"
})

temp.render(document.body)

updateCount(10)
```

{{t.pages.documentation.templating.lifecycles.content.if_you_want_to_react_to_a_specific_state_change_you_can_use_the_effect_state_effect_md_the_onupd}}

### {{t.pages.documentation.templating.lifecycles.content.onmove}}

{{t.pages.documentation.templating.lifecycles.content.the_onmove_method_takes_a_function_to_be_called_whenever_the_template_render_target_changes}}

```javascript
const temp = html`<h1>Hello World</h1>`

temp.onMove(() => {
    console.log('moved to', temp.parentNode)
})

temp.render(document.body)

setTimeout(() => {
    temp.render(document.getElementById('app'))
}, 1000)
```

{{t.pages.documentation.templating.lifecycles.content.this_livecycle_is_perfect_to_perform_action_dependent_on_the_template_location_these_can_be_thin}}

### {{t.pages.documentation.templating.lifecycles.content.chaining}}

{{t.pages.documentation.templating.lifecycles.content.all_template_livecycles_and_render_methods_index_md_rendering_can_be_chained_and_you_should_alwa}}

```javascript
const [count, updateCount] = state(0)

const temp = html`<p>${count}</p>`
    .onMount(() => {
        console.log('mounted')

        return () => {
            console.log('unmounted')
        }
    })
    .onUpdate(() => {
        console.log('udpated', temp.toString())
    })
    .onMove(() => {
        updateCount(10)
        console.log('moved', temp.parentNode)
    })
    .render(document.body)

setTimeout(() => {
    temp.render(document.getElementById('app'))
}, 1000)

setTimeout(() => {
    temp.unmount()
}, 2000)
```
