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
                In addition to
                <a href="./is-isnot-helpers#is-helper">is</a> and
                <a href="./is-isnot-helpers#isnot-helper">isNot</a> helpers,
                this library offers additional boolean helpers right out of the
                box.
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
                The <code>or</code> helper will return true at least one of the
                provided values is <code>TRUTHY</code>.
            </p>
            <p>
                It takes comma-separated arguments and at least two must be
                provided.
            </p>
            <p>
                <code>or(VAL1, VAL2, ...VALN)</code> where the values can be
                anything including a state value.
            </p>
            ${CodeSnippet('html`${or(val1, val2)}`', 'typescript')}
            ${Heading('and helper', 'h3')}
            <p>
                The <code>and</code> helper will return true if all the values
                provided are <code>TRUTHY</code>.
            </p>
            <p>
                It takes comma-separated arguments and at least two must be
                provided.
            </p>
            <p>
                <code>and(VAL1, VAL2, ...VALN)</code> where the values can be
                anything including a state value.
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
        `,
    })
