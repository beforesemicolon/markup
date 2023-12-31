import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { PageComponentProps } from '../type'

export default ({
    name,
    page,
    nextPage,
    prevPage,
    docsMenu,
}: PageComponentProps) =>
    DocPageLayout({
        name,
        page,
        prevPage,
        nextPage,
        docsMenu,
        content: html`
            ${Heading(page.name)}
            <p>
                Event handling remains close to the native way but enhanced with
                active listeners instead. Think about it more like an inline
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener"
                    >addEventListener</a
                >
                instead event attributes.
            </p>
            ${CodeSnippet(
                'const handleClick = (evt: Event) => {\n' +
                    '  evt.preventDefault();\n' +
                    '  evt.stopPropagation();\n' +
                    '}\n' +
                    '\n\n' +
                    'html`<button onclick="${handleClick}">click me</button>`\n' +
                    '// renders: <button>click me</button>`',
                'typescript'
            )}
            <p>
                The inline event attributes are removed during parsing before
                the DOM element is created and will never show on the page.
            </p>
            <p>
                All event attributes must start with <code>on</code> keyword
                followed by the name of the event. This is nothing specific to
                this library but something native to HTML itself.
            </p>
            <p>The value of this attribute must be a function of any type.</p>
            ${Heading('Custom events', 'h3')}
            <p>
                You may also listen to custom events just like you would with
                native ones. The pattern remains the same and you get a
                <code>CustomEvent</code> instead of an
                <code>Event</code> instance.
            </p>
            ${CodeSnippet(
                'const handleClick = (evt: CustomEvent) => {\n' +
                    '  // handle here\n' +
                    '}\n' +
                    '\n\n' +
                    'html`<my-button onclicked="${handleClick}">click me</my-button>`\n' +
                    '// renders: <button>click me</button>`',
                'typescript'
            )}
            <p>This is particularly good when working with web components.</p>
            ${Heading('Event options', 'h3')}
            <p>
                One thing that you cannot do natively in HTML, but you can with
                Markup is providing
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options"
                    >event listener options</a
                >.
            </p>
            ${CodeSnippet(
                'const handleClick = (evt) => {\n' +
                    '  // will only get called once\n' +
                    '}\n' +
                    '\n' +
                    'html`<button onclick="${handleClick}, ${{once: true}}">click me</button>`\n' +
                    '// renders: <button>click me</button>',
                'typescript'
            )}
            <p>
                All you need to do is add a comma followed by the option you
                want to provide to the listener.
            </p>
        `,
    })
