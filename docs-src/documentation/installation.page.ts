import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { IntroGroup } from '../data/documents'
import { CodeSnippet } from '../partials/code-snippet'

const page = IntroGroup.list[1]

export default DocPageLayout(
    page.path,
    html`
        <h2>${page.name}</h2>
        <p>
            The templating system is a plug-and-play package which means you can
            either use the CDN or npm to install it. There is no need to any
            additional setup or requirements.
        </p>
        <h3>Via unpkg CDN</h3>
        <p>
            This method is the quickest loading option and can be placed in the
            <code>head</code> tag of the document.
        </p>
        ${CodeSnippet(
            '<script src="https://unpkg.com/@beforesemicolon/html/dist/client.js" />',
            'html'
        )}
        <p>You may also specify a specific version you want.</p>
        ${CodeSnippet(
            ' <script src="https://unpkg.com/@beforesemicolon/html@1.0.0/dist/client.js"/>',
            'html'
        )}
        <h4>Accessing content</h4>
        <p>
            The client CDN link will create a global variable you can access for
            all the internal functions.
        </p>
        ${CodeSnippet('const {html} = BFS;', 'javascript')}

        <h3>Via npm</h3>
        <p>
            This package is also available via <code>npm</code> which will allow
            you to use it in server JavaScript environments
        </p>
        ${CodeSnippet('npm install @beforesemicolon/html', 'vim')}

        <h4>Accessing content</h4>
        ${CodeSnippet(
            'import {html} from "@beforesemicolon/html";',
            'javascript'
        )}

        <h3>Typescript</h3>
        <p>
            This package was built using typescript. There is no need to install
            a separate type package for it. All types are exported with it.
        </p>
    `
)
