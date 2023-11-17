import { html } from '../src'
import { PageLayout } from './partials/page-layout'
import reasons from './data/reasons.json'
import { CodeSnippet } from './partials/code-snippet'

export default PageLayout({
    stylesheets: html`
        <link rel="stylesheet" href="./stylesheets/hybrid.hightlighter.css" />
        <link rel="stylesheet" href="./stylesheets/landing.css" />
    `,
    content: html`
        <!-- Banner -->
        <div class="wrapper">
            <div class="banner">
                <h2>HTML Templating System</h2>
                <p>All you needed is a good templating system!</p>
                <div class="actions">
                    <a href="./documentation" class="btn">Documentation</a>
                    <a
                        href="./documentation/essential-training"
                        class="btn outline"
                        >Learn</a
                    >
                </div>
            </div>
        </div>
        <!-- Why -->
        <div class="wrapper">
            <section class="why">
                <h2>Why This Templating System?</h2>
                <p>
                    Every great UI library or framework is nothing without its
                    templating system. What if you had a great standalone
                    templating system of your own? This is just that, and it is
                    amazing what you can do with just a good template. But it
                    does not stop there...
                </p>
                <div class="reason-list">
                    ${reasons.map(
                        (reason) => html`
                            <div class="reason-border">
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
                            </div>
                        `
                    )}
                </div>
            </section>
        </div>
        <div class="get-started wrapper">
            <h2>Quick Start</h2>
            <p>Install it in your project</p>
            ${CodeSnippet(
                'npm install @beforesemicolon/markup\n\n' +
                    '# or\n\n' +
                    'yarn add @beforesemicolon/markup',
                'typescript'
            )}
            <p>
                Or simply add the following script in the head of your document
            </p>
            ${CodeSnippet(
                '<script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"/>',
                'html'
            )}
        </div>
        <!-- what you can do -->
        <section class="what-to-build wrapper">
            <h2>What can you do with it?</h2>
            <p>
                The templating system will handle all the rendering needs for
                you. With that out of the way, what you can build is really up
                to you. It can be a full web application, a UI components
                library or the next UI framework. The only limit is your
                imagination.
            </p>
            <a href="" class="btn">Try it</a>
        </section>
    `,
})
