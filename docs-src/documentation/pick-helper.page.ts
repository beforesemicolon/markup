import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'
import { PageComponentProps } from '../type'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout(
        page.title,
        page.path,
        docsMenu,
        html`
            ${Heading(page.name)}
            <p>The <code>pick</code> helper is a quick way to read</p>
            ${Heading('The problem', 'h3')}
            <p>
                If you have a state value and try to read a deep value it would
                look like so:
            </p>
            ${CodeSnippet(
                'const [user, setUser] = state({name: "John Doe"})\n' +
                    '\n' +
                    'html`${() => user().name}`',
                'typescript'
            )}
            <p>
                The issue here is that when the <code>user</code> changes the
                DOM will not update because the template only react to states
                that are provided directly in the template. The above example a
                function is provided and the template cannot see inside the
                function to see the state and subscribe to changes.
            </p>
            <p>
                Instead, you can use the <code>pick</code> helper which lets you
                provide the object and the keychain to look for
            </p>
            ${CodeSnippet(
                'const [user, setUser] = state({name: "John Doe"})\n' +
                    '\n' +
                    "html`${pick(user, 'name')}`",
                'typescript'
            )}
            <p>
                The template in this case sees the state because the helper will
                tell the template about it and therefore update when the state
                changes.
            </p>
            <p>It takes two arguments and both are required.</p>
            <p><code>pick(OBJECT, KEYCHAIN_STRING)</code></p>
            <ul>
                <li>
                    <strong>OBJECT</strong>: Any JavaScript object which value
                    can be chained to access the value (Array, Object).
                </li>
                <li>
                    <strong>KEYCHAIN_STRING</strong>: A string with dot
                    separated keys.
                </li>
            </ul>
            ${Heading('Deep values', 'h3')}
            <p>
                It would not be fair if the key access was shallow. The problem
                would persist for access of deep values.
            </p>
            <p>
                The <code>pick</code> helper second argument can be a
                dot-notation string that can go deep.
            </p>
            ${CodeSnippet(
                "html`${pick(user, 'role.name')}`\n\n" +
                    "html`${pick(list, '1.status.value')}`\n\n" +
                    "html`${pick(response, 'projects.0.name')}`",
                'typescript'
            )}
            <p>
                You may also use it to access other keys from the object, for
                example the length or size.
            </p>
            ${CodeSnippet(
                "html`${pick(list, 'length')}`\n\n" +
                    "html`${pick(set, 'size')}`",
                'typescript'
            )}
            ${DocPrevNextNav({
                prev: prevPage,
                next: nextPage,
            })}
        `
    )
