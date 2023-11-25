import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { CodeSnippet } from '../partials/code-snippet'
import { Heading } from '../partials/heading'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'
import { PageComponentProps } from '../type'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout(
        page.title,
        page.description,
        page.path,
        docsMenu,
        html`
            ${Heading(page.name)}
            <p>
                One special thing about Markup template is that it is an
                instance object, which you can do a lot of things to. One of
                these things is the ability to replace one template with the
                another.
            </p>
            <p>
                Let's take for example an async rendering scenario where you
                render a loading indicator then need to replace this loading
                indicator with the actual loaded content.
            </p>
            ${CodeSnippet(
                'const loadingIndicator = html`<p>loading...</p>`;\n' +
                    '\n' +
                    'const fetchContent = () => {\n' +
                    '  setTimeout(() => { // simulate HTTP call\n' +
                    '    const content = html`<p>loaded content</p>`;\n' +
                    '    \n' +
                    '    // render content by telling it what to replace\n' +
                    '    content.replace(loadingIndicator)\n' +
                    '  }, 2500)\n' +
                    '}\n' +
                    '\n' +
                    'html`${loadingIndicator}`\n' +
                    '  .render(document.body);\n' +
                    '\n' +
                    'fetchContent();',
                'typescript'
            )}
            <p>
                The above example will initially render the
                <code>loading...</code> text and after 2.5 seconds it will
                replace it with the content template.
            </p>
            <p>
                The replace method will insert the not-yet-rendered template
                nodes in the place in the DOM the target template was rendered.
                This means that you can have multiple tags, and it will just
                replace them all.
            </p>
            ${Heading('Replacing HTML Element', 'h3')}
            <p>
                You may also target a specific DOM Element. Here is the same
                example but with the loading indicator as an Element instead of
                an HTML Template.
            </p>
            ${CodeSnippet(
                '// using a HTMLParagraphElement instance\n' +
                    "const loadingIndicator = document.createElement('p');\n" +
                    "loadingIndicator.textContent = 'Loading...'\n" +
                    '\n' +
                    'const fetchContent = () => {\n' +
                    '  setTimeout(() => {\n' +
                    '    const content = html`<p>loaded content</p>`;\n' +
                    '    \n' +
                    '    content.replace(loadingIndicator)\n' +
                    '  }, 2500)\n' +
                    '}\n' +
                    '\n' +
                    'html`${loadingIndicator}`\n' +
                    '  .render(document.body);\n' +
                    '\n' +
                    'fetchContent();',
                'typescript'
            )}
            ${Heading('Replacing "Must known"', 'h3')}
            <ul>
                <li>
                    The target template must be already rendered in the DOM in
                    order for the "replacing" to happen.
                </li>
                <li>
                    The target can be an
                    <a
                        href="https://developer.mozilla.org/en-US/docs/Web/API/Element"
                        >Element</a
                    >
                    instance but it cannot be <code>HTMLBodyElement</code>,
                    <code>HTMLHeadElement</code>, <code>HTMLHtmlElement</code>,
                    or <code>ShadowRoot</code> as these are crucial elements in
                    the document.
                </li>
                <li>
                    If the replacement template has not been yet rendered, it
                    will but if it is already rendered somewhere else in the
                    DOM, it will be moved from that location to the location
                    where the target is.
                </li>
            </ul>
            ${DocPrevNextNav({
                prev: prevPage,
                next: nextPage,
            })}
        `
    )
