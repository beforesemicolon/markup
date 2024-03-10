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
                Markup is a plug and play library, which means, you don't need
                to build or compile it into anything to be able to see what you
                build.
            </p>
            <p>
                Additionally, you can run it on the client and server to produce
                any type of application.
            </p>
            ${Heading('Essentials Training', 'h3')}
            <a
                class="training-banner"
                target="_blank"
                href="https://www.youtube.com/watch?v=mIr2XglV5nQ&list=PLpWvGP6yhJUgWNiz25vj__CArY9Z0O6ke&index=1"
            >
                <img
                    src="../assets/markup-essentials-training.jpg"
                    alt="Markup Essentials Training"
                />
                <p>
                    Learn everything about Markup including tips and best
                    practice guides to build web interface.
                </p>
            </a>
            ${Heading('Try it in-Browser', 'h3')}
            <p>
                The simplest way to start is by trying it in-browser, and we
                have set up few project you can get started with:
            </p>
            <ul>
                <li>
                    <a
                        href="https://stackblitz.com/edit/web-platform-lvonxr"
                        target="_blank"
                        >Client ToDo App with State Management</a
                    >
                    (StackBlitz)
                </li>
                <li>
                    <a
                        href="https://stackblitz.com/edit/web-platform-ixypdh"
                        target="_blank"
                        >Client Counter App</a
                    >
                    (StackBlitz)
                </li>
                <li>
                    <a
                        href="https://codepen.io/beforesemicolon/pen/yLQzQZV"
                        target="_blank"
                        >Client Timer App</a
                    >
                    (CodePen)
                </li>
                <li>
                    <a
                        href="https://stackblitz.com/edit/stackblitz-starters-a6rvq7"
                        target="_blank"
                        >Node SSR website</a
                    >
                    (StackBlitz)
                </li>
            </ul>
            ${Heading('HTML File', 'h3')}
            <p>
                The simplest way to start is by creating an
                <code>html</code> file and adding the following content. You can
                then open it in the browser to see.
            </p>
            ${CodeSnippet(
                '<!DOCTYPE html>\n' +
                    '<html lang="en">\n' +
                    '  <head>\n' +
                    '    <title>Hello World</title>\n' +
                    '    <meta charset="UTF-8" />\n' +
                    '    <meta name="viewport" content="width=device-width" />\n' +
                    '    <script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"></script>\n' +
                    '  </head>\n' +
                    '  <body>\n' +
                    '    <div id="app"></div>\n\n' +
                    '    <script>\n' +
                    '      const { html, state } = BFS.MARKUP;\n' +
                    '\n' +
                    '      html`\n' +
                    '        <h1>Hello World</h1>\n' +
                    "      `.render(document.getElementById('app'));\n" +
                    '    </script>\n' +
                    '  </body>\n' +
                    '</html>\n',
                'typescript'
            )}
            ${Heading('Vite Project', 'h3')}
            <p>
                Another amazing way to start is by using
                <a href="https://vitejs.dev/">vite</a> to create a project.
            </p>
            <p>Simply run the following command:</p>
            ${CodeSnippet('npm create vite@latest', 'typescript')}
            <p>You are then prompted and you should:</p>
            <ol>
                <li>Enter project name</li>
                <li>Select <code>Vanilla</code> as the framework</li>
                <li>
                    Select either <code>TypeScript</code>(prefered) or
                    <code>JavaScript</code>
                </li>
            </ol>
            <p>
                This will create a project in the current directory you are on.
                You can then follow by installing Markup.
            </p>
            ${CodeSnippet('npm install @beforesemicolon/markup', 'typescript')}
            <p>
                For project content, you can look at the following
                <a
                    href="https://stackblitz.com/edit/web-platform-ixypdh"
                    target="_blank"
                    >Web App</a
                >
                example to have an idea on how to structure things. Markup has
                everything you need to start simple.
            </p>
        `,
    })
