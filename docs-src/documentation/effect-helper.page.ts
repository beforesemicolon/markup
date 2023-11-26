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
                When using <a href="./state-values">state</a> data you notice
                that only the part of the template dependent on the state will
                update with changes.
            </p>
            <p>
                For those situations you could want to perform "side effects",
                meaning, you want other part of the template to change with the
                state change.
            </p>
            <p>
                That is when the <code>effect</code> helper comes in. To help
                you perform these side effects directly in the template.
            </p>
            ${CodeSnippet(
                'const doubleCount = () => count() * 2;\n' +
                    '\n' +
                    'const counter = html`\n' +
                    '  <p>${count}</p>\n' +
                    '\n' +
                    '  <!-- Also display count doubled whenever count changes -->\n' +
                    '  <p>${effect(count, doubleCount)}</p>\n' +
                    '`;',
                'typescript'
            )}
            <p>
                Above example shows a simple example of how to perform a side
                effect to display double of count whenever count changes.
            </p>
            <p>
                Bellow example shows that using <code>effect</code> we can react
                to something like the <code>activeTab</code> state change to
                dynamically get content for the tab and render it.
            </p>
            ${CodeSnippet(
                "type Tab = 'home' | 'about' | 'contact';\n\n" +
                    'const tabContent: Record<Tab, HTMLTemplate> = {\n' +
                    '  home: html`<h1>Welcome</h1>`,\n' +
                    '  contact: html`<p>Tell us what you think</p>`,\n' +
                    '  about: html`<p>We are here to help you</p>`,\n' +
                    '}\n' +
                    '\n' +
                    'const [activeTab, setActiveTab] = state<Tab>("home");\n' +
                    '\n' +
                    'const app = html`\n' +
                    '  <h1>Tab Example</h1>\n' +
                    '  <ul>\n' +
                    '    <li \n' +
                    '      attr.class.active="${is(activeTab, \'home\')}" \n' +
                    '      onclick="${() => setActiveTab(\'home\')}">\n' +
                    '      Home\n' +
                    '    </li>\n' +
                    '    <li \n' +
                    '      attr.class.active="${is(activeTab, \'about\')}"\n' +
                    '      onclick="${() => setActiveTab(\'about\')}">\n' +
                    '      About\n' +
                    '    </li>\n' +
                    '    <li \n' +
                    '      attr.class.active="${is(activeTab, \'contact\')}"\n' +
                    '      onclick="${() => setActiveTab(\'contact\')}">\n' +
                    '      Contact\n' +
                    '    </li>\n' +
                    '  </ul>\n' +
                    '  ${effect(activeTab, () => tabContent[activeTab()])}\n' +
                    '`;\n' +
                    '\n' +
                    'app.render(document.body)',
                'typescript'
            )}
            ${Heading('Effect format', 'h3')}
            <p>
                The <code>effect</code> helper takes comma-separated states and
                the last argument must be the action to take or, the "thing" you
                need to be returned or rendered.
            </p>
            <p><code>effect(STATE, ...STATE, SIDE_EFFECT_ACTION)</code></p>
            ${CodeSnippet(
                "// react to 'activeTab' and 'currentPath' state changes \n" +
                    "// to load content by calling 'contentLoader'\n" +
                    'effect(activeTab, currentPath, contentLoader)',
                'typescript'
            )}
        `,
    })
