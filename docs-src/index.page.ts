import { html } from '../src'
import { PageLayout } from './partials/page-layout'
import reasons from './data/reasons.json'
import { CodeSnippet } from './partials/code-snippet'
import { PageComponentProps } from './type'

export default ({ page, name }: PageComponentProps) =>
    PageLayout({
        siteName: name,
        page,
        stylesheets: html`
            <link
                rel="stylesheet"
                href="./stylesheets/hybrid.hightlighter.css"
            />
            <link rel="stylesheet" href="./stylesheets/landing.css" />
        `,
        content: html`
            <!-- Banner -->
            <div class="banner">
                <h2>HTML Templating System</h2>
                <p>
                    All you need is a
                    <strong>reactive templating system</strong> to build
                    anything.
                </p>
                <div class="actions">
                    <a href="./documentation" class="btn">Documentation</a>
                    <a href="./documentation/get-started" class="btn outline"
                        >Get Started</a
                    >
                </div>
            </div>
            <!-- Why -->
            <section class="why">
                <h2>Why Markup?</h2>
                <p>
                    The best UI frameworks and libraries out there rely heavily
                    on a good templating system. Nobody uses React without JSX
                    or Angular without its HTML templates. Now, what if you had
                    a standalone reactive templating system? Something that is:
                </p>
                <ul class="reason-list">
                    ${reasons.map(
                        (reason) => html`
                            <li class="reason-border">
                                <div class="reason">
                                    <img
                                        src="${reason.img}"
                                        alt="${reason.imgAlt}"
                                    />
                                    <h3>${reason.title}</h3>
                                    <p>${reason.description}</p>
                                    ${reason.breakDown
                                        ? html`
                                              <ul>
                                                  ${reason.breakDown.map(
                                                      (b) =>
                                                          html`<li>
                                                              ${html([b])}
                                                          </li>`
                                                  )}
                                              </ul>
                                          `
                                        : ''}
                                </div>
                            </li>
                        `
                    )}
                </ul>
            </section>
            <section class="get-started">
                <h2>Quick Start</h2>
                <p>Install it in your project</p>
                ${CodeSnippet(
                    'npm install @beforesemicolon/markup',
                    'typescript'
                )}
                <p>or</p>
                ${CodeSnippet('yarn add @beforesemicolon/markup', 'typescript')}
                <p>
                    Or simply add the following script in the head of your
                    document.
                </p>
                ${CodeSnippet(
                    '<script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"></script>',
                    'html'
                )}
            </section>
            <!-- what you can do -->
            <section class="what-to-build">
                <h2>What can you do with it?</h2>
                <p>
                    The templating system will handle all the rendering needs of
                    your project. With that out of the way, what you can build
                    is up to you. It can be a full web application, a UI
                    components library or the next UI framework. The only limit
                    is your imagination.
                </p>
                <a
                    href="https://stackblitz.com/edit/web-platform-lvonxr?file=app.js"
                    class="btn"
                    target="_blank"
                    >Try it</a
                >
            </section>
        `,
    })
