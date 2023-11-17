import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { IntroGroup, TemplatingGroup } from '../data/documents'
import { CodeSnippet } from '../partials/code-snippet'
import { Heading } from '../partials/heading'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'

const page = TemplatingGroup.list[0]

export default DocPageLayout(
    page.path,
    html`
        ${Heading(page.name)}
        <p>
            It is simple to create a template. You will need to use the
            <code>html</code> core API and it is straight forward to use.
        </p>
        ${CodeSnippet(
            'import {html} from "@beforesemicolon/markup";\n\n\n' +
                'html`<h1>Hello Worls</h1>`;',
            'typescript'
        )}

        <p>
            The <code>html</code> is a
            <a
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates"
                >tagged template,</a
            >
            which is a special way to create
            <a
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals"
                >template literals</a
            >. Inside you can place any valid HTML and it will be handled
            accordingly.
        </p>

        <p>
            This is nothing specific to this package. It is pure JavaScript.
            Template literals allow to create templates in an elegant and simple
            way, a capability that makes this library possible. If you know
            JavaScript and HTML, you already know 85% of this system.
        </p>
        ${Heading('How it works?', 'h3')}
        <p>
            When you create the template, nothing happens. No parsing, no
            evaluation of any kind. This means that you can create a lot of
            these templates and have it waiting are properties, variable, and
            return values.
        </p>
        <p>
            When you create a template you get a
            <code>HTMLTemplate</code> instance which we will exploring
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
            The render method accepts an element in the document where template
            should be rendered. It is only when the render is requested that the
            template is parsed to HTML Elements.
        </p>
        <p>
            The rendering happens ONCE. If you call the
            <code>render</code> method repeatedly only the first call will
            render content and the rest will be ignored.
        </p>
        <p>
            For whatever reason, if you really want to force a re-render, you
            can specify the second argument value to <code>true</code> to force
            a re-render.
        </p>
        ${CodeSnippet(
            'temp.render(document.body)\n' +
                'temp.render(document.body, true) // forces re-render',
            'typescript'
        )}
        ${Heading('Understanding rendering', 'h4')}
        <p>
            One thing to remember is that the <code>html</code> returns a
            <code>HTMLTemplate</code> instance which contains unique instances
            of every
            <code
                ><a href="https://developer.mozilla.org/en-US/docs/Web/API/Node"
                    >Node</a
                ></code
            >. Essentially it works like a <code>Node</code> meaning, the same
            instance cannot be in 2 places ate once.
        </p>
        <p>
            If you render a template in a place in the DOM, then try to render
            it in a different place, it will be automatically removed from the
            previous place.
        </p>
        ${Heading('Unmounting', 'h3')}
        <p>
            Another method you have available is one that gives you the ability
            to unmount your template the right way.
        </p>
        ${CodeSnippet('temp.unmount()', 'typescript')}
        <p>
            After you unmount, you can render the template again or use it to
            replace another.
        </p>
        ${DocPrevNextNav({
            prev: {
                label: IntroGroup.list[4].name,
                link: IntroGroup.list[4].path,
            },
            next: {
                label: TemplatingGroup.list[1].name,
                link: TemplatingGroup.list[1].path,
            },
        })}
    `
)
