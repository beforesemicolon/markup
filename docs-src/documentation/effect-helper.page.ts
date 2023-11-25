import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
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
                When using <a href="./state-values">state</a> you will notice
                that only the part of the template dependent on the state will
                update with changes.
            </p>
            <p>
                For those situations you would want to perform "side effects" on
                the template, meaning, you want other part of the template to
                change with some state change.
            </p>
            <p>
                That is when the <code>effect</code> helper comes in. To help
                you perform these side effects.
            </p>
            ${CodeSnippet(
                'const counter = html`\n' +
                    '  <p>${count}</p>\n' +
                    '  <p>${effect(count, () => count() * 2)}</p>\n' +
                    '`;'
            )}
            <p>
                The above example shows a simple example of performing a side
                effect. The bellow example show using <code>effect</code> we can
                react to the <code>activeTab</code>
                state change to get the content and render it.
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
                The <code>effect</code> take comma-separated states and as the
                last argument should be the action to take or the "thing" you
                need to be returned.
            </p>
            <p><code>effect(STATE, ...STATE, SIDE_EFFECT_ACTION)</code></p>
            ${CodeSnippet(
                'effect(activeTab, currentPath, contentLoader)',
                'typescript'
            )}
            ${DocPrevNextNav({
                prev: prevPage,
                next: nextPage,
            })}
        `
    )
