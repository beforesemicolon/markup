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
            <p>
                This library is extremely function-oriented and things can get
                messy when you try to check things in the template. However,
                that's not the reason the most of the helpers exist.
            </p>
            <p>
                All helpers are used to perform side effects, meaning, to react
                to
                <a href="./state-values">state</a> changes. Instead of using the
                <code>effect</code> helper for everything, you can use ones with
                very specific capabilities and that are more readable.
            </p>
            ${Heading('is helper', 'h3')}
            <p>
                The <code>is</code> helper will return a boolean whether the
                check on a value or state matches.
            </p>
            <p>It takes two arguments and both are required.</p>
            <p><code>is(VALUE_OR_STATE, CHECKER_OR_VALUE)</code></p>
            <ul>
                <li>
                    <strong>VALUE_OR_STATE</strong>: It can be any raw value or
                    a value defined by the state.
                </li>
                <li>
                    <strong>CHECKER_OR_VALUE</strong>: A value to check against
                    or a function that does the checking.
                </li>
            </ul>
            ${CodeSnippet('html`${is(val, isNumber)}`', 'typescript')}
            <p>
                It can be used anywhere in the template, inside templates, as
                attribute values and even body content.
            </p>
            ${CodeSnippet(
                'html`<button attr.disabled="is(status, \'logged\')">login</button>`',
                'typescript'
            )}
            ${Heading('isNot helper', 'h3')}
            <p>
                The <code>isNot</code> helper works the same as the
                <code>is</code> helper but checks the opposite.
            </p>
            ${CodeSnippet('html`${isNot(val, isNumber)}`', 'typescript')}
            ${DocPrevNextNav({
                prev: prevPage,
                next: nextPage,
            })}
        `
    )
