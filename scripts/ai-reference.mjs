import { readFile } from 'node:fs/promises'
import { generateReference } from './generate-ai-reference.mjs'

const guide = '/documentation/guide'
const templateGuide = '/documentation/templating/'
const utilityGuide = '/documentation/utilities/'
const authored = (summary, docs, body, keywords = [], notes, names) => ({
    summary,
    docs,
    body,
    keywords,
    notes,
    names,
})
const type = (name, summary, docs = guide) =>
    authored(summary, docs, `export type { ${name} }`)

const filter = {
    docs: '/documentation/utilities/repeat',
    fixture: 'filter',
    summary: 'Render keyed rows from a reactive collection.',
    keywords: ['loop', 'list', 'filter', 'collection', 'stable order'],
    notes: [
        'Keep the original collection in state. Derive the filtered view with a function that reads the query and the collection.',
        'Use a stable unique key. Do not use the array index when items can reorder.',
        'Create a repeat binding per independent list; it retains key data for that list.',
    ],
}

const guidance = {
    html: {
        ...filter,
        docs: templateGuide,
        summary: 'Create, mount, and compose reactive HTML templates.',
        keywords: [
            'render',
            'template',
            'native elements',
            'binding',
            'event',
            'DOM',
        ],
        notes: [
            'Pass a state getter as an interpolation to keep it reactive; calling it eagerly captures a snapshot.',
            'Use real event handler functions in quoted native-style bindings such as onclick. Pass a stable handler directly unless it needs a closed-over argument.',
            'Templates interpolate data as text or as the target attribute/property. Use native semantics and never concatenate untrusted strings into HTML.',
        ],
    },
    state: {
        ...filter,
        docs: '/documentation/state/',
        summary:
            'Create a state getter, setter, and optional subscriber cleanup.',
        keywords: ['signal', 'state', 'filter', 'clear', 'store', 'reactive'],
        notes: [
            'Use the setter to replace arrays or objects instead of mutating them in place.',
            'The third return value removes the optional subscriber supplied at state creation. To stop an effect, use the cleanup returned by effect instead.',
        ],
    },
    repeat: filter,
    pick: {
        ...filter,
        docs: '/documentation/utilities/pick',
        summary: 'Read a nested object or array value as a reactive getter.',
        keywords: ['nested', 'path', 'derived', 'filter', 'length'],
        notes: [
            'Use a dotted path such as details.name or items.0.name. Use the optional mapper only when presentation requires conversion.',
        ],
    },
    when: {
        ...filter,
        docs: '/documentation/utilities/when',
        summary:
            'Render one value when a condition is truthy and another otherwise.',
        keywords: ['conditional', 'fallback', 'toggle', 'empty state'],
        notes: [
            'Use a reactive condition and keep both branches free of side effects.',
        ],
    },
    is: {
        ...filter,
        docs: '/documentation/utilities/is-&-isnot',
        summary:
            'Check a reactive value for truthiness, equality, a regular expression, or a predicate.',
        keywords: ['equals', 'check', 'condition', 'predicate'],
        notes: [
            'Without a second argument, check truthiness. With a regular expression, avoid global or sticky flags unless you intend their stateful behavior.',
        ],
    },
    effect: authored(
        'Run a side effect when the state it reads changes, with explicit cleanup.',
        '/documentation/state/effect',
        [
            "const [name, setName] = state('Ready')",
            'const previous = document.title',
            'const stop = effect(() => {',
            '    document.title = name()',
            '    return () => { document.title = previous }',
            '})',
            "setName('Working')",
            "window.addEventListener('pagehide', stop, { once: true })",
        ].join('\n'),
        [
            'subscribe',
            'effect',
            'side effect',
            'dispose',
            'cleanup',
            'lifecycle',
        ],
        [
            'Keep effects out of template evaluation. Start component work from the owner lifecycle and tear it down there.',
            'The callback runs immediately. Its returned cleanup runs before the next execution and when you call the returned disposer.',
        ],
        ['effect', 'state']
    ),
    HtmlTemplate: authored(
        'Manage the lifetime of a template returned by html.',
        '/documentation/templating/lifecycles',
        [
            'const template = html\x60<p>Mounted content</p>\x60',
            '    .onMount(() => {',
            '        const controller = new AbortController()',
            "        window.addEventListener('resize', () => console.log(window.innerWidth), { signal: controller.signal })",
            '        return () => controller.abort()',
            '    })',
            'if (template instanceof HtmlTemplate) template.render(document.body)',
            "window.addEventListener('pagehide', () => template.unmount(), { once: true })",
        ].join('\n'),
        [
            'template',
            'mount',
            'unmount',
            'cleanup',
            'render',
            'event',
            'lifecycle',
        ],
        [
            'Prefer the html factory. Attach lifecycle hooks before rendering. Return cleanup from onMount and use unmount instead of removing the root DOM node directly.',
        ],
        ['HtmlTemplate', 'html']
    ),
    unsafeHTML: authored(
        'Parse explicitly trusted raw HTML.',
        templateGuide,
        "unsafeHTML('<strong>Trusted constant</strong>').render(document.body)",
        ['raw', 'trusted HTML'],
        [
            'For external text or other untrusted data, use html with interpolation instead. This function does not sanitize input.',
        ]
    ),
    and: authored(
        'Check that at least two supplied values are all truthy.',
        '/documentation/utilities/and-or-&-oneof',
        'console.assert(and(true, () => true)())',
        ['all', 'condition', 'boolean']
    ),
    or: authored(
        'Check that one of at least two supplied values is truthy.',
        '/documentation/utilities/and-or-&-oneof',
        'console.assert(or(false, () => true)())',
        ['any', 'condition', 'boolean']
    ),
    isNot: authored(
        'Negate the is helper for a literal, regular expression, or predicate.',
        '/documentation/utilities/is-&-isnot',
        "console.assert(isNot('draft', 'published')())",
        ['not', 'different', 'condition']
    ),
    oneOf: authored(
        'Check if a value is included in a list of choices.',
        '/documentation/utilities/and-or-&-oneof',
        "console.assert(oneOf('edit', ['view', 'edit'])())",
        ['include', 'includes', 'choices', 'condition']
    ),
    element: authored(
        'Create a detached native or registered custom element.',
        '/documentation/utilities/element',
        "document.body.append(element('p', { textContent: 'Hello' }))",
        ['create element', 'dom', 'node'],
        [
            'Use textContent for untrusted text. This helper does not create a reactive template.',
        ]
    ),
    suspense: authored(
        'Show loading, success, and error content for an asynchronous action.',
        '/documentation/utilities/suspense',
        'html\x60\${suspense(async () => \'Loaded\', html\x60<p role="status">Loading</p>\x60)}\x60.render(document.body)',
        ['async', 'promise', 'load'],
        [
            'Discarded results do not cancel the underlying request. Pass an AbortSignal to your own cancellable request when needed.',
        ],
        ['suspense', 'html']
    ),
    val: authored(
        'Evaluate a value once if it is a getter, otherwise return it unchanged.',
        utilityGuide,
        'console.assert(val(() => 7) === 7)',
        ['value', 'getter', 'unwrap'],
        [
            'Use at helper boundaries. In a template, pass the getter directly to preserve reactivity.',
        ]
    ),
    visible: authored(
        'Delay rendering until a placeholder enters the viewport.',
        '/documentation/utilities/visible',
        'visible(() => html\x60<p>Details</p>\x60, html\x60<p>Pending</p>\x60).render(document.body)',
        ['viewport', 'lazy rendering', 'intersection observer'],
        [
            'Supply a placeholder with measurable size. If IntersectionObserver is not available, render eagerly.',
        ],
        ['visible', 'html']
    ),
    DynamicValueType: authored(
        'Identify the type of a dynamic binding when writing a custom directive.',
        '/documentation/templating/html-attributes',
        'console.log(DynamicValueType.Directive)',
        ['directive', 'binding', 'enum']
    ),
    DynamicValue: type(
        'DynamicValue',
        'Describe a dynamic content, attribute, directive, or event binding.'
    ),
    ObjectLiteral: type(
        'ObjectLiteral',
        'Describe an indexable object of values.'
    ),
    StateGetter: type(
        'StateGetter',
        'Type a function that reads a reactive state value.',
        '/documentation/state/'
    ),
    StateSetter: type(
        'StateSetter',
        'Type a function that updates a reactive state value.',
        '/documentation/state/'
    ),
    StateSubscriber: type(
        'StateSubscriber',
        'Type the optional callback notified by state changes.',
        '/documentation/state/'
    ),
    StateUnSubscriber: type(
        'StateUnSubscriber',
        'Type the function that removes the optional state subscriber.',
        '/documentation/state/'
    ),
    EffectCleanup: type(
        'EffectCleanup',
        'Type cleanup returned by an effect callback.',
        '/documentation/state/effect'
    ),
    EffectSubscriber: type(
        'EffectSubscriber',
        'Type the effect callback, its previous value, and result.',
        '/documentation/state/effect'
    ),
    EffectUnSubscriber: type(
        'EffectUnSubscriber',
        'Type the disposer returned by effect.',
        '/documentation/state/effect'
    ),
    AnythingButAFunction: type(
        'AnythingButAFunction',
        'Type the non-function argument accepted by comparison helpers.'
    ),
    HelperValueChecker: type(
        'HelperValueChecker',
        'Type a predicate for a comparison helper.'
    ),
    ElementOptions: type(
        'ElementOptions',
        'Type attributes, text, inner HTML, children, and namespace options for element.',
        '/documentation/utilities/element'
    ),
    LifecycleCallback: type(
        'LifecycleCallback',
        'Type the callback for a template lifecycle hook.',
        '/documentation/templating/lifecycles'
    ),
    RepeatData: type(
        'RepeatData',
        'Type accepted collection inputs for repeat.',
        '/documentation/utilities/repeat'
    ),
    RepeatOptions: type(
        'RepeatOptions',
        'Type stable row identity and empty result rendering for repeat.',
        '/documentation/utilities/repeat'
    ),
    VisibleOptions: type(
        'VisibleOptions',
        'Type viewport observation options for visible.',
        '/documentation/utilities/visible'
    ),
}

await generateReference({
    slug: 'markup',
    documentation: 'https://markup.beforesemicolon.com',
    browserRoots: { MARKUP: 'namespace' },
    guidance,
    examples: {
        'occurrence-board': {
            title: 'Keep duplicate rows and async work scoped',
            names: ['html', 'state', 'effect', 'repeat', 'when'],
            markup: '<main><button id="close-board" type="button">Close board</button><section id="board" aria-label="Occurrence board"></section></main>',
            body: await readFile(
                new URL('./ai-examples/occurrence-board.js', import.meta.url),
                'utf8'
            ),
        },
        filter: {
            title: 'Filter a reactive list',
            names: ['html', 'state', 'repeat', 'when', 'pick', 'is'],
            markup: '<main id="app"></main>',
            body: await readFile(
                new URL('./ai-examples/filter.js', import.meta.url),
                'utf8'
            ),
        },
    },
})
