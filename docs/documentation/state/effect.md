---
name: '{{t.pages.documentation.state.effect.meta.effect}}'
order: 7.1
title: '{{t.pages.documentation.state.effect.meta.state_effect_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.state.effect.meta.use_markup_effect_to_track_state_dependencies_react_to_multiple_state_changes_clean_up_subscript}}'
layout: document
---

## {{t.pages.documentation.state.effect.content.effect}}

{{t.pages.documentation.state.effect.content.the_effect_api_complements_the_state_index_api_by_providing_a_better_way_to_react_to_multiple_st}}

```typescript
type EffectCleanup = () => void
type EffectSubscriber<T> = (
    value: T | undefined
) => undefined | T | EffectCleanup
type EffectUnSubscriber = () => void

effect: <T>(sub: EffectSubscriber<T>) => EffectUnSubscriber
```

{{t.pages.documentation.state.effect.content.the_state_api_allows_you_to_subscribe_to_changes_of_its_value}}

```javascript
const [count, updateCount] = state(0, () => {
    // react to changes
})

updateCount(10)
```

{{t.pages.documentation.state.effect.content.this_is_great_if_you_want_to_perform_side_effects_related_to_a_single_state_to_perform_side_effe}}

```javascript
const [count, updateCount] = state(0)

effect(() => {
    // react to changes
})

updateCount(10)
```

#### {{t.pages.documentation.state.effect.content.effectunsubscriber}}

{{t.pages.documentation.state.effect.content.some_side_effects_can_stay_there_continuosly_as_a_global_effect_to_something_specific_others_nee}}

```javascript
const cleanEffect = effect(() => {
    // react to changes
})

cleanEffect()
```

#### {{t.pages.documentation.state.effect.content.cleanup}}

{{t.pages.documentation.state.effect.content.returning_a_function_registers_cleanup_instead_of_caching_it_cleanup_runs_before_the_next_effect}}

```javascript
const stop = effect(() => {
    const controller = new AbortController()
    loadData({ signal: controller.signal })

    return () => controller.abort()
})

stop() // also runs the latest cleanup
```

### {{t.common.content.how_it_works}}

{{t.pages.documentation.state.effect.content.when_you_call_a_stategetter_inside_the_effect_callback_function_the_effect_becomes_aware_of_the}}

{{t.pages.documentation.state.effect.content.the_effect_calls_the_provided_callback_as_soon_as_its_declared_so_it_becomes_aware_of_the_states}}

```javascript
effect(() => {
    console.log(count()) // will log right away
})
```

{{t.pages.documentation.state.effect.content.the_effect_also_batches_updates_which_allows_you_to_update_multiple_state_at_once_and_only_have}}

{{t.pages.documentation.state.effect.content.reactive_template_updates_finish_before_user_effects_run_so_dom_reads_and_refs_match_the_current_state}}

```javascript
effect(() => {
    console.log(count(), total())
    // prints: 0 0 on initiation
    // prints: 1 1 on update of both values
})

setCount((prev) => prev + 1)
setTotal((prev) => prev + 1)
```

{{t.pages.documentation.state.effect.content.the_batch_update_is_useful_but_the_effect_also_understand_initialization_which_allows_you_to_mak}}

```javascript
effect(() => {
    console.log(count())
    // prints: 0 on initiation
    // print: 100 after the while loop completes
})

while (count() < 100) {
    setCount((prev) => prev + 1)
}
```

#### {{t.pages.documentation.state.effect.content.caching}}

{{t.pages.documentation.state.effect.content.the_effect_allows_you_to_return_non_function_values_that_are_cached_and_provided_in_the_callback_for}}

{{t.pages.documentation.state.effect.content.for_example_perform_a_debounce_effect_on_search_value_changes}}

```javascript
const [search, setSearch] = state('')
const [searchResults, updateSearchResults] = state([])

effect((timer) => {
    clearTimeout(timer)

    // so the effect becomes aware of "search" state
    const searchValue = search()

    return setTimeout(async () => {
        const response = api.search({ searchValue })

        updateSearchResults(response.results)
    }, 300)
})
```

#### {{t.pages.documentation.state.effect.content.async_effect}}

{{t.pages.documentation.state.effect.content.the_effect_works_synchronously_that_s_how_it_detects_the_states_inside_and_caches_data}}

{{t.pages.documentation.state.effect.content.however_callback_you_provide_to_the_effect_can_be_asynchronous_if_you_really_want_to}}

```javascript
effect(async () => {
    try {
        const res = await fetch(
            `https://randomuser.me/api/?page=${count()}&results=10&seed=markup`
        )

        console.log(await res.json())
    } catch (e) {
        console.error(e)
    }
})
```

{{t.pages.documentation.state.effect.content.if_you_do_so_the_cached_data_will_be_the_promise_returned_by_the_function_and_not_the_data_you_r}}

```javascript
effect(async (res = Promise.resolve(0)) => {
    const result = count() + (await res)

    console.log(result)

    return result
})
```

#### {{t.pages.documentation.state.effect.content.nested_effect}}

{{t.pages.documentation.state.effect.content.you_can_nest_effect_to_track_different_values_this_allows_for_the_body_of_your_effect_to_react_i}}

```javascript
const unsub = effect(() => {
    console.log('outer', count())
    effect(() => {
        console.log('inner', count())
    })
})

unsub() // clears all effects
```

{{t.pages.documentation.state.effect.content.if_you_want_to_clear_all_effects_you_can_unsubscribe_from_the_outer_most_effect_and_which_will_t}}
