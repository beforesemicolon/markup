import {
    DynamicValueType,
    effect,
    element,
    html,
    is,
    repeat,
    state,
    visible,
} from '@beforesemicolon/markup'
import type {
    AnythingButAFunction,
    DynamicValue,
    EffectCleanup,
    EffectSubscriber,
    EffectUnSubscriber,
    ElementOptions,
    HelperValueChecker,
    LifecycleCallback,
    ObjectLiteral,
    RepeatData,
    RepeatOptions,
    StateGetter,
    StateSetter,
    StateSubscriber,
    StateUnSubscriber,
    VisibleOptions,
} from '@beforesemicolon/markup'

interface Track {
    id: string
    title: string
}

// Describe four bindings on paper. These descriptors belong to this exercise.
// Markup does not expose a binding list on a rendered template.
type BindingExample = Pick<DynamicValue, 'type' | 'name'>
export const bindings: BindingExample[] = [
    { type: DynamicValueType.Content, name: 'track title' },
    { type: DynamicValueType.Attribute, name: 'disabled' },
    {
        type: DynamicValueType.Directive,
        name: 'attribute object in the opening tag',
    },
    { type: DynamicValueType.Event, name: 'onclick' },
]

// RepeatData describes the source, RepeatOptions describes how rows keep identity.
const trackKey: RepeatOptions<Track, string> = {
    key: (track) => track.id,
    empty: () => html`<li>Your queue is empty.</li>`,
}

export function renderTracks(tracks: RepeatData<Track>) {
    return html`<ol>
        ${repeat(tracks, (track) => html`<li>${track.title}</li>`, trackKey)}
    </ol>`
}

// ElementOptions describes the element to create. VisibleOptions controls
// when the content is revealed. The placeholder has measurable height.
const artworkOptions: VisibleOptions = { rootMargin: '100px', threshold: 0 }

export function artworkFor(artist: string, src: string) {
    const attributes: ObjectLiteral<string> = {
        alt: `Artwork for ${artist}`,
        src,
    }
    const settings: ElementOptions<typeof attributes> = { attributes }
    return visible(
        () => element('img', settings),
        html`<div style="min-height: 120px">Album artwork</div>`,
        artworkOptions
    )
}

// Here is(value, comparison) accepts a comparison value or a checker function.
const silent = 0 satisfies AnythingButAFunction<number>
const belowHalf: HelperValueChecker<number> = (value) => value < 0.5

export function volumeModel(onChange: StateSubscriber) {
    const [volume, setVolume, stopNotifications]: readonly [
        StateGetter<number>,
        StateSetter<number>,
        StateUnSubscriber,
    ] = state(0.5, onChange)
    return {
        volume,
        setVolume,
        stopNotifications,
        isSilent: is(volume, silent),
        isQuiet: is(volume, belowHalf),
    }
}

// The caller can attach this callback with view.onMount(callback).
// Mounting starts the effect. Removing the view stops it.
export function syncVolume(volume: StateGetter<number>): LifecycleCallback {
    return (view) => {
        const media = view.refs.media?.[0]
        if (!(media instanceof HTMLAudioElement)) return

        const applyVolume: EffectSubscriber<number> = (previous) => {
            const next = volume()
            if (next !== previous) media.volume = next
            return next
        }
        const stop: EffectUnSubscriber = effect(applyVolume)
        const cleanup: EffectCleanup = () => stop()
        return cleanup
    }
}
