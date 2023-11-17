import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { IntroGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'

const page = IntroGroup.list[0]

export default DocPageLayout(
    page.path,
    html`
        ${Heading(page.name)}
        <p>
            A reactive HTML templating system that can be used in any JavaScript
            environment, client or server.
        </p>
        <ul>
            <li>
                <strong>Reactive</strong>: The template will react to all and
                specific state or data change to update where is needed only.
            </li>
            <li>
                <strong>Independent</strong>: The template does not depend on
                any setup or extension in order to accomplish really complex
                things. It is plug-and-play, ready to go anywhere.
            </li>
            <li>
                <strong>Fast</strong>: It uses one of the fastest HTML parser
                and the algorithm is designed to only run code related to the
                things that changed which allows for really fast updates.
            </li>
            <li>
                <strong>Small</strong>: The minified code is less than 20kB and
                the CDN compressed code is less than 1kB while the entire
                package raw is less than 70kB.
            </li>
            <li>
                <strong>Simple</strong>: With just two core APIs, learning it is
                pretty straight forward even so if you already know JavaScript
                and HTML. Everything else, which is not much, is to aid with
                templating.
            </li>
            <li>
                <strong>Client & Server</strong>: The templating system is
                environment agnostic which allows it to run in any Javascript
                environment without additional setup.
            </li>
        </ul>
        ${Heading('Motivation', 'h3')}
        <p>
            It is hard to find a templating system with all these traits. Most
            templating systems are reliant on the environment they are used.
            Also, none of them take care of DOM changes and are too simple to
            build full system just with them alone. Let's look at few examples:
        </p>
        <ul>
            <li>
                <strong>Pug, EJS, and similar</strong>: These run in different
                environments but only server side. They are just meant to create
                static content while everything else is handled by the
                surrounding environment. They solve for the limitations of using
                HTML alone like conditional rendering, repetitions, and template
                values/variables.
            </li>
            <li>
                <strong>JSX, Lit/html and similar</strong>: These templating
                languages are powerful, but they are not independent. They
                require the environment to handle the result like compiling to
                DOM elements and tracking changes. They just smartly convert
                some syntax to some API that can be then used to render.
            </li>
        </ul>
        <p>
            On the other hand, this templating system challenges the concept
            that templating is just about compiling to HTML or that you need
            complex libraries and framework to create web applications.
        </p>
        <p>
            <q>All you need is a good templating system</q> - is the motto that
            drives this system and one that will allow you to quickly start and
            be in total control.
        </p>
        <details>
            <summary>FAQ</summary>
            <dl>
                <dt>What can you build with it?</dt>
                <dd>
                    The short answer is - anything. We have examples that range
                    from small "components" to complex web applications.
                </dd>
                <dt>Should I be concerned about the bundle size?</dt>
                <dd>
                    No. This package is tiny despite its capabilities. You can
                    use the CDN only or bundle with your application with no
                    worries as its footprint is too small to impact your
                    application loading time.
                </dd>
                <dt>Has it been tested in production?</dt>
                <dd>
                    This entire documentation website uses it, and it is
                    statically rendered. It is also been used by all
                    @beforesemicolon websites now in production.
                </dd>
                <dt>Is it stable</dt>
                <dd>
                    This package went through an extensive beta and alpha period
                    tested by different developers both in performance and
                    reliability. It is now in its stable stage.
                </dd>
                <dt>Can I use it with Node, BunJs, and Deno?</dt>
                <dd>
                    Yes, it can be used in any JavaScript environment, both
                    client and server. Tests have not been completed in other
                    environments yet but the goal is to make it available
                    anywhere.
                </dd>
            </dl>
        </details>
        ${DocPrevNextNav({
            next: {
                label: IntroGroup.list[1].name,
                link: IntroGroup.list[1].path,
            },
        })}
    `
)
