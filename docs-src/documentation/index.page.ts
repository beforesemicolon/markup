import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { PageComponentProps } from '../type'
import reasons from '../data/reasons.json'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout({
        page,
        prevPage,
        nextPage,
        docsMenu,
        content: html`
            ${Heading(page.name)}
            <p>
                Markup is a reactive HTML templating system that can run in any
                JavaScript environment, client or server, and simplify how web
                views can be created. Additionally:
            </p>
            <ul>
                ${reasons.map(
                    (reason) => html`
                        <li>
                            <strong>${reason.title}</strong>:
                            ${reason.description}
                        </li>
                    `
                )}
            </ul>
            ${Heading('Motivation', 'h3')}
            <p>
                It is hard to find a templating system with all these traits.
                Most templating systems are reliant on the environment they are
                used, which limits them significantly. Also, none of them take
                care of DOM changes and are too simple to build full system just
                with them alone. Let's look at few examples:
            </p>
            <ul>
                <li>
                    <strong>Pug, EJS, and similar</strong>: These run in
                    different environments but only server side. They are just
                    meant to create static content while everything else is
                    handled by the surrounding environment. They solve for the
                    limitations of using HTML alone like conditional rendering,
                    repetitions, and template values/variables.
                </li>
                <li>
                    <strong>JSX, Lit/html and similar</strong>: These templating
                    languages are powerful, but they are not independent. They
                    require the environment to handle the result like compiling
                    to DOM elements and tracking changes. They just smartly
                    convert some syntax to some API that can be then used to
                    render DOM nodes.
                </li>
            </ul>
            <p>
                But, this templating system challenges the concept that
                templating is just about compiling to HTML or that you need
                complex libraries and framework to create web applications.
            </p>
            <p>
                <q>All you need is a good templating system</q> - is the motto
                that drives this system and one that will allow you to quickly
                start and be in total control of the interface.
            </p>
            <details>
                <summary>FAQ</summary>
                <dl>
                    <dt>What can you build with it?</dt>
                    <dd>
                        The short answer is - anything. We have examples that
                        range from small "components" to complex web
                        applications.
                    </dd>
                    <dt>Should I be concerned about the bundle size?</dt>
                    <dd>
                        No. This package is tiny despite its capabilities. You
                        can use the CDN only or bundle with your application
                        with no worries as its footprint is too small to impact
                        your application loading time.
                    </dd>
                    <dt>Has it been tested in production?</dt>
                    <dd>
                        This entire documentation website uses it, and it is
                        statically rendered. It is also been used by all
                        @beforesemicolon websites now in production. We can help
                        you with anything if you decide to make that move.
                    </dd>
                    <dt>Is it stable</dt>
                    <dd>
                        This package went through an extensive beta and alpha
                        periods of testing by different developers both in
                        performance and reliability. It is now in its stable
                        stage and we would appreciate any feedback and issue
                        reports.
                    </dd>
                    <dt>Can I use it with Node, BunJs, and Deno?</dt>
                    <dd>
                        Yes, it can be used in any JavaScript environment, both
                        client and server. Tests have not been completed in all
                        environments yet but the goal is to make it available
                        anywhere.
                    </dd>
                </dl>
            </details>
        `,
    })
