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
                In addition to
                <a href="./is-isnot-helpers#is-helper">is</a> and
                <a href="./is-isnot-helpers#isnot-helper">isNot</a> helpers,
                this library offers additional boolean helpers.
            </p>
            <p>
                All these helpers will return <code>true</code> or
                <code>false</code> and can be used anywhere in the template
            </p>
            <p>
                All the values for these helpers can be a raw value or any
                <a href="./state-values">state</a> value.
            </p>
            ${Heading('or helper', 'h3')}
            <p>
                The <code>or</code> helper will return true whether either value
                is truthy.
            </p>
            <p>It takes two arguments and both are required.</p>
            <p>
                <code>or(VAL1, VAL2)</code> where the values can be anything
                including a state value.
            </p>
            ${CodeSnippet('html`${or(val1, val2)}`', 'typescript')}
            ${Heading('and helper', 'h3')}
            <p>
                The <code>and</code> helper will return true when both values
                are truthy.
            </p>
            <p>It takes two arguments and both are required.</p>
            <p>
                <code>and(VALUE_OR_STATE1, VALUE_OR_STATE2)</code> where the
                values can be anything including a state value.
            </p>
            ${CodeSnippet('html`${and(val1, val2)}`', 'typescript')}
            ${Heading('oneOf helper', 'h3')}
            <p>
                The <code>oneOf</code> helper will take a value or state value
                and a list of many possible values and return true if the value
                provided is in that list.
            </p>
            <p>It takes two arguments and both are required.</p>
            <p>
                <code>oneOf(VALUE_OR_STATE, ARRAY_OF_VALUE_OR_STATE)</code>
                where the values can be anything including a state value.
            </p>
            ${CodeSnippet(
                'html`${oneOf(val, ["one", "two", "three"])}`',
                'typescript'
            )}
            ${DocPrevNextNav({
                prev: prevPage,
                next: nextPage,
            })}
        `
    )
