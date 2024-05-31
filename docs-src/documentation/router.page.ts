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
        nextPage,
        prevPage,
        docsMenu,
        content: html`
            ${Heading(page.name)}
            <p>
                Before Semicolon offers a routing package built with
                <a
                    href="https://www.npmjs.com/package/@beforesemicolon/web-component"
                    >WebComponent</a
                >
                which is built on top of <strong>Markup</strong>.
            </p>
            ${CodeSnippet(
                '<nav>\n' +
                    '    <page-link path="/">Home</page-link>\n' +
                    '    <page-link path="/contact">Contact</page-link>\n' +
                    '</nav>\n' +
                    '\n' +
                    '<page-route path="/">\n' +
                    '    Home content\n' +
                    '</page-route>\n' +
                    '\n' +
                    '<page-route path="/contact">\n' +
                    '    Contact content\n' +
                    '</page-route>\n' +
                    '\n' +
                    '<page-route path="/404">\n' +
                    '    404 - Page not found!\n' +
                    '</page-route>\n' +
                    '\n' +
                    '<page-redirect to="/404"></page-redirect>',
                'html'
            )}
            ${Heading('Examples', 'h3')}
            <ul>
                <li>
                    <a href="https://bfs-router.netlify.app/" target="_blank"
                        >Demo doc</a
                    >
                </li>
                <li>
                    <a
                        href="https://stackblitz.com/edit/stackblitz-starters-jrfnhm?file=index.html"
                        target="_blank"
                        >Tabs</a
                    >
                </li>
            </ul>
            ${Heading('Installation', 'h3')}
            <p>via npm:</p>
            ${CodeSnippet('npm install @beforesemicolon/router', 'vim')}
            <p>via yarn:</p>
            ${CodeSnippet('yarn add @beforesemicolon/router', 'vim')}
            <p>via cdn:</p>
            ${CodeSnippet(
                '<!-- required WebComponent Markup to be present -->\n' +
                    '<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>\n' +
                    '\n' +
                    '\n' +
                    '<!-- use the latest version -->\n' +
                    '<script src="https://unpkg.com/@beforesemicolon/router/dist/client.js"></script>\n' +
                    '\n' +
                    '<!-- use a specific version -->\n' +
                    '<script src="https://unpkg.com/@beforesemicolon/router@0.1.0/dist/client.js"></script>\n' +
                    '\n' +
                    '<!-- link you app script after -->\n' +
                    '<script>\n' +
                    '    const { ... } = BFS.ROUTER\n' +
                    '</script>',
                'html'
            )}
            ${Heading('Components', 'h3')}
            <ul>
                <li><a href="./router#page-route">page-route</a></li>
                <li>
                    <a href="./router#page-route-query">page-route-query</a>
                </li>
                <li><a href="./router#page-link">page-link</a></li>
                <li><a href="./router#page-redirect">page-redirect</a></li>
            </ul>
            ${Heading('Page route', 'h3')}
            <p>
                You can specify the title and the body content to conditionally
                render.
            </p>
            ${CodeSnippet(
                '<page-route path="/" title="Welcome">\n' +
                    '  Home content\n' +
                    '</page-route>',
                'html'
            )}
            <p>
                Lazy load html content with fallback content and loading
                indicator.
            </p>
            ${CodeSnippet(
                '<page-route path="/contact" src="/contact.html">\n' +
                    '  <div slot="loading">Loading...</div>\n' +
                    '  <div slot="fallback">\n' +
                    '    Oops - Failed to load content\n' +
                    '  </div>\n' +
                    '</page-route>',
                'html'
            )}
            <p>Import JavaScript file which must default export:</p>
            <ul>
                <li>Text;</li>
                <li>HTML string;</li>
                <li>DOM Node;</li>
                <li>Markup template;</li>
                <li>
                    Any object with a "render" method that takes an element to
                    render at;
                </li>
                <li>Function that returns any of the above;</li>
            </ul>
            ${CodeSnippet(
                '<page-route \n' +
                    '    path="/greeting" \n' +
                    '    src="./greeting.page.js" \n' +
                    '></page-route>',
                'html'
            )}
            ${CodeSnippet(
                '// greeting.page.js\n' +
                    'const { html } = BFS.MARKUP\n' +
                    '\n' +
                    'export default () => {\n' +
                    '  return html`<p>Hello World</p>`\n' +
                    '}\n',
                'javascript'
            )}
            <p>
                Route nesting by specifying the <code>exact</code> attribute
                with <code>false</code> value.
            </p>
            ${CodeSnippet(
                '<page-route path="/todos" exact="false">\n' +
                    '    <!-- child page route already knows its inside a page-route \n' +
                    '       so its parent path already prefixes its own which means\n' +
                    '       bellow page-route path is actually "/todos/pending" -->\n' +
                    '    <page-route path="/pending">\n' +
                    '        ...\n' +
                    '    </page-route>\n' +
                    '</page-route>',
                'html'
            )}
            ${Heading('Page route query', 'h3')}
            <p>
                The <code>page-route-query</code> work exactly like page-route
                but reacts to the search query of the url instead. It takes a
                key and value attributes instead of a <code>path</code>.
            </p>
            ${CodeSnippet(
                '<page-route-query key="tab" value="sample">\n' +
                    '  sample tab content\n' +
                    '</page-route-query>',
                'html'
            )}
            <p>
                Use the <code>default</code> attribute to tell it to render
                content even if the key is not present.
            </p>
            ${CodeSnippet(
                '<page-route-query key="tab" value="sample" default="true">\n' +
                    '    sample tab content\n' +
                    '</page-route-query>',
                'html'
            )}
            ${Heading('Page link', 'h3')}
            <p>
                A link that lets you navigate to any page. Works similar to
                <code>goToPage</code> and takes similar options.
            </p>
            ${CodeSnippet(
                '<page-link \n' +
                    '  path="/"\n' +
                    '  title="Welcome"\n' +
                    '  data=\'{"sample": "value"}\'\n' +
                    '>\n' +
                    '  Home Info\n' +
                    '</page-link>',
                'html'
            )}
            <p>Paths can also contain search query in the path.</p>
            ${CodeSnippet(
                '<page-link path="/router/index.html?tab=sample">sample tab</page-link>',
                'html'
            )}
            <p>Or specify it separately.</p>
            ${CodeSnippet(
                '<page-link path="/sample" search="tab=info">new tab</page-link>',
                'html'
            )}
            <p>
                You can choose to keep current search query and only add your
                specified search.
            </p>
            ${CodeSnippet(
                '<page-link path="/sample" search="tab=info" keep-current-search="true">new tab</page-link>',
                'html'
            )}
            <p>
                Similar to
                <a href="./router#page-route-query">page-route-query</a>
                <code>default</code> attribute, you can mark the specified
                search as default to put the link in an active state for styling
                purpose.
            </p>
            ${CodeSnippet(
                '<page-link path="/todos" search="tab=pending" default="true">Pending Todos</page-link>\n' +
                    '<page-link path="/todos" search="tab=in-progress">In Progress Todos</page-link>\n' +
                    '<page-link path="/todos" search="tab=completed">Completed Todos</page-link>',
                'html'
            )}
            <p>
                The link is context aware and leaving out the
                <code>path</code> attribute defaults to the closest
                <a href="./router#page-route">page-route</a>
                <code>path</code> or <code>/</code>. You can also refer to the
                closed page route path with the <code>$</code> prefix.
            </p>
            ${CodeSnippet(
                '<page-route path="/todos">\n' +
                    '    <page-link search="tab=pending" default="true">Pending Todos</page-link>\n' +
                    '    <page-link search="tab=in-progress">In Progress Todos</page-link>\n' +
                    '    <page-link search="tab=completed">Completed Todos</page-link>\n' +
                    '    \n' +
                    '    <page-link path="$/create">new tab</page-link>\n' +
                    '</page-route>',
                'html'
            )}
            <p>
                Styling the <code>page-link</code> is straight forward allowing
                you to even target link states.
            </p>
            ${CodeSnippet(
                '/* the actual page-link tag */\n' +
                    'page-link {\n' +
                    '    ...\n' +
                    '}\n' +
                    '\n' +
                    'page-link.active {\n' +
                    '    ...\n' +
                    '}\n' +
                    '\n' +
                    '/* the anchor tag inside */\n' +
                    'page-link::part(anchor) {\n' +
                    '    text-decoration: none;\n' +
                    '    color: #444;\n' +
                    '    padding: 10px;\n' +
                    '    border-bottom: 2px solid transparent;\n' +
                    '}\n' +
                    '\n' +
                    'page-link::part(anchor active) {\n' +
                    '    background: #b4fff8;\n' +
                    '    border-color: #222;\n' +
                    '    color: #000;\n' +
                    '}\n' +
                    '\n' +
                    'page-link::part(anchor):visited { ... }\n' +
                    'page-link::part(anchor):active { ... }\n' +
                    'page-link::part(anchor):hover { ... }',
                'css'
            )}
            ${Heading('Page redirect', 'h3')}
            <p>
                The <code>page-redirect</code> lets you automatically redirect
                to a path if not a known one. You should place it after all
                <a href="./router#page-route">page-route</a> rendered on the
                page.
            </p>
            ${CodeSnippet(
                '<page-route path="/" src="./index.html"></page-route>\n' +
                    '<page-route path="/contact" src="./contact.html"></page-route>\n' +
                    '<page-route path="/about" src="./about.html"></page-route>\n' +
                    '<page-route path="/404"></page-route>\n' +
                    '<!-- render it after all page-routes-->\n' +
                    '<page-redirect to="/404"></page-redirect>',
                'html'
            )}
            <p>
                When placed inside a page-route, it will redirect whenever any
                unknown route starting with the parent page-route is detected.
            </p>
            ${CodeSnippet(
                '<page-route path="/project">\n' +
                    '    ...\n' +
                    '    <page-redirect to="/project/not-found"></page-redirect>\n' +
                    '</page-route>',
                'html'
            )}
            <p>
                Sometimes you want to always redirect to a child route when a
                parent path is matched and for that you can specify the redirect
                type to be always.
            </p>
            ${CodeSnippet(
                '<page-route path="/todos" exact="false">\n' +
                    '    Todos:\n' +
                    '    <page-route path="/pending">pending todos</page-route>\n' +
                    '    <page-route path="/in-progress">in progress todos</page-route>\n' +
                    '    <page-route path="/completed">completed todos</page-route>\n' +
                    '    <page-redirect to="/todos/pending" type="always"></page-redirect>\n' +
                    '</page-route>\n' +
                    '<page-route path="/404"></page-route>\n' +
                    '\n' +
                    '<page-redirect to="/404"></page-redirect>\n' +
                    '<page-redirect to="/todos" type="always"></page-redirect>',
                'html'
            )}
            ${Heading('Additional APIs', 'h3')}
            <p>
                You have access to internal APIs that you can use in your
                JavaScript code to perform any similar actions.
            </p>

            ${Heading('goToPage', 'h4')}
            <p>
                Takes you to a new page pathname. It takes the path name, an
                optional data and a page title.
            </p>
            ${CodeSnippet(
                "goToPage('/sample')\n" +
                    "goToPage('/test', {sample: \"value\"}, 'test page')",
                'javascript'
            )}
            ${Heading('replacePage', 'h4')}
            <p>
                Replaces the current page pathname. It takes the path name, an
                optional data and a page title.
            </p>
            ${CodeSnippet(
                "replacePage('/new', {data: 3000}, 'new page')",
                'javascript'
            )}
            ${Heading('nextPage', 'h4')}
            <p>Takes you to the next page.</p>
            ${CodeSnippet('nextPage()', 'javascript')}
            ${Heading('previousPage', 'h4')}
            <p>Takes you to the previous page.</p>
            ${CodeSnippet('previousPage()', 'javascript')}
            ${Heading('onPageChange', 'h4')}
            <p>
                A listener for page changes. Takes a callback function that its
                called with the path name, a search query object literal, and
                any data set for the page.
            </p>
            ${CodeSnippet(
                'onPageChange((pathName, searchQuery, data) => {\n' +
                    '\t...\n' +
                    '})',
                'javascript'
            )}
            ${Heading('getSearchQuery', 'h4')}
            <p>
                Returns a object literal representation of the search query.
                Parses any value including JSON strings.
            </p>
            ${CodeSnippet('getSearchQuery();', 'javascript')}
            ${Heading('updateSearchQuery', 'h4')}
            <p>Takes a object literal and updates the search query.</p>
            ${CodeSnippet(
                'updateSearchQuery({\n' +
                    '  date: "2020-01-01",\n' +
                    '  sample: 30\n' +
                    '})',
                'javascript'
            )}
            ${Heading('getPageData', 'h4')}
            ${CodeSnippet('getPageData();', 'javascript')}
        `,
    })
