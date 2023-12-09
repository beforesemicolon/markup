import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { PageComponentProps } from '../type'
import { CodeSnippet } from '../partials/code-snippet'

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
                Markup can run on the server with the right setup. This means
                that you can render things on the server and send to the client.
            </p>
            <p>Take for example this simple page created with Markup.</p>
            ${CodeSnippet(
                '// ./server/pages/home.page.ts\n\n' +
                    'import {html} from "@beforesemicolon/markup";\n' +
                    '\n' +
                    'interface HomePageProps {\n' +
                    '  title: string;\n' +
                    '}\n' +
                    '\n' +
                    'export const HomePage = ({title}: HomePageProps) => {\n' +
                    '  return html`\n' +
                    '    <!doctype html>\n' +
                    '    <html lang="en">\n' +
                    '      <head>\n' +
                    '        <meta charset="UTF-8">\n' +
                    '        <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
                    '        <title>${title}</title>\n' +
                    '      </head>\n' +
                    '      <body>\n' +
                    '        <h1>Hello World</h1>\n' +
                    '      </body>\n' +
                    '    </html>\n' +
                    ' `\n' +
                    '}',
                'typescript'
            )}
            <p>
                We can then have a simple express server to render everything.
            </p>
            ${CodeSnippet(
                '// ./server/app.ts\n\n' +
                    "import express, {Request, Response} from 'express';\n" +
                    'import path from "path";\n' +
                    '\n' +
                    'export const app = express();\n' +
                    '\n' +
                    "app.use(express.static(path.resolve(__dirname, 'public')))",
                'typescript'
            )}
            <p>We can then render the page as so:</p>
            ${CodeSnippet(
                '// ./server/app.ts\n\n' +
                    'import {HomePage} from "./public/home.page.ts";\n' +
                    'import {toStatic} from "./to-static.ts";\n\n' +
                    "app.get('/', (_req: Request, res: Response) => {\n" +
                    '  res.send(toStatic(HomePage({\n' +
                    "    title: 'Welcome To The Page'\n" +
                    '  })))\n' +
                    '})',
                'typescript'
            )}
            <p>
                In the above example you can see the
                <code>toStatic</code> helper function. This is something you can
                easily create to convert <code>HTMLTemplate</code> into
                <code>HTML string</code> that we can send to the client.
            </p>
            <p>The <code>toStatic</code> implementation looks like so:</p>
            ${CodeSnippet(
                '// ./server/to-static.ts\n\n' +
                    "import 'global-jsdom/register'\n" +
                    'import {HtmlTemplate} from "@beforesemicolon/markup";\n' +
                    '\n' +
                    "export const toStatic = (temp: HtmlTemplate, docType = '<!doctype html>') => {\n" +
                    "  document.body.innerHTML = ''\n" +
                    '  temp.render(document.body)\n' +
                    '  return docType + document.body.innerHTML.trim()\n' +
                    '}\n',
                'typescript'
            )}
            <p>
                Notice that there is a <code>global-jsdom</code> package and all
                it does is make DOM APIs global that Markup can use to function
                normally.
            </p>
            <p>
                This is a simple example on how to approach rendering things on
                the server. The main requirement is to have some type of DOM API
                that can render on the server environment you use (Deno, Bun,
                Node, etc). From there, making such APIs globally available will
                cover everything, and you can use Markup freely.
            </p>
            <a href="https://stackblitz.com/edit/stackblitz-starters-a6rvq7"
                >Try it Out</a
            >
        `,
    })
