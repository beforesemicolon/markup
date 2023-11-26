import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { CodeSnippet } from '../partials/code-snippet'
import { Heading } from '../partials/heading'
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
        nextPage,
        prevPage,
        docsMenu,
        content: html`
            ${Heading(page.name)}
            <p>
                To create a template you will need to use the
                <code>html</code> core API and it is straight forward to use.
            </p>
            ${CodeSnippet(
                'import {html} from "@beforesemicolon/markup";\n\n' +
                    'html`<h1>Hello Worls</h1>`;',
                'typescript'
            )}
            <p>
                The <code>html</code> is a
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates"
                    >tagged template,</a
                >
                function which is a special way to create
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals"
                    >template literals</a
                >. Inside you can place any valid HTML and it will be handled
                accordingly.
            </p>
            <p>
                This is not a pattern specific to Markup. It is pure JavaScript.
                Template literals allow you to create templates in an elegant
                and simple way, and it is a capability that makes this library
                possible.
            </p>
            ${Heading('How it works?', 'h3')}
            <p>
                When you define a template, nothing happens. No parsing, no
                evaluation of any kind. This means that you can create a lot of
                these templates and have it waiting as properties, variable, and
                return values. Like a true first class citizen.
            </p>
            <p>
                When you create a template you get a
                <code>HTMLTemplate</code> instance which we will explore
                throughout these documents.
            </p>
            ${Heading('Rendering', 'h3')}
            <p>
                Everything starts with the rendering, and it happens via the
                <code>render</code> method from the
                <code>HTMLTemplate</code> instance.
            </p>
            ${CodeSnippet(
                'const temp = html`<h1>Hello Worls</h1>`;\n\n' +
                    'temp.render(document.body)',
                'typescript'
            )}
            <p>
                The render method accepts a DOM element where the template
                should be rendered. It is only when the render is call that the
                template is parsed to HTML Elements.
            </p>
            <p>
                The rendering happens only ONCE. If you call the
                <code>render</code> method repeatedly only the first call will
                actually render content.
            </p>
            <p>
                For whatever reason, if you really want to force a re-render,
                you can specify the second argument value of
                <code>true</code> to force a re-render.
            </p>
            ${CodeSnippet(
                'temp.render(document.body)\n' +
                    'temp.render(document.body, true) // forces re-render',
                'typescript'
            )}
            ${Heading('Understanding rendering', 'h4')}
            <p>
                One thing to remember is that the <code>html</code> returns a
                <code>HTMLTemplate</code> instance which contains unique
                instances of every
                <code
                    ><a
                        href="https://developer.mozilla.org/en-US/docs/Web/API/Node"
                        >Node</a
                    ></code
                >. Essentially it works like a <code>Node</code> meaning, the
                same instance cannot be in 2 places on the document at once.
            </p>
            <p>
                If you render a template in a place in the DOM, then try to
                render it in a different place, it will be automatically removed
                from the previous place.
            </p>
            ${Heading('Unmounting', 'h3')}
            <p>
                Another method you have available is the
                <code>unmount</code> which gives you the ability to unmount your
                template the right way.
            </p>
            ${CodeSnippet('temp.unmount()', 'typescript')}
            <p>
                The unmount method will unsubscribe from any
                <a href="./state-values">state</a> and reset the template
                instance to its original state ready to be re-rendered by
                calling the <code>render</code> method.
            </p>
        `,
    })
