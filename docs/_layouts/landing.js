import meta from './_head-meta.js'
import header from './_header.js'
import footer from './_footer.js'
import copyCode from './_copy-code.js'
import pkg from '../../package.json' with { type: 'json' }

const escapeHTML = (value) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

const highlightLine = (line) => {
    const tokens = []
    const regex =
        /(\/\/.*$)|(`[^`]*`|'[^']*'|"[^"]*")|(<\/?[a-zA-Z][\w-]*)|(\b(?:const|let|var|function|return|import|from|export|new|class|if|else|extends|static|async|await|try|catch)\b|=>)|(\$\{[^}]*\}|\{[^{}]*\})|([a-zA-Z-]+)(?==)/g
    let lastIndex = 0
    let match

    while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
            tokens.push(escapeHTML(line.slice(lastIndex, match.index)))
        }

        const value = escapeHTML(match[0])

        if (match[1]) {
            tokens.push(`<span class="syntax-comment">${value}</span>`)
        } else if (match[2]) {
            tokens.push(`<span class="syntax-string">${value}</span>`)
        } else if (match[3]) {
            tokens.push(`<span class="syntax-tag">${value}</span>`)
        } else if (match[4]) {
            tokens.push(`<span class="syntax-keyword">${value}</span>`)
        } else if (match[5]) {
            tokens.push(`<span class="syntax-expression">${value}</span>`)
        } else if (match[6]) {
            tokens.push(`<span class="syntax-attr">${value}</span>`)
        }

        lastIndex = match.index + match[0].length
    }

    if (lastIndex < line.length) {
        tokens.push(escapeHTML(line.slice(lastIndex)))
    }

    return tokens.join('')
}

const renderCodeBlock = (filename, code, lang = 'javascript') => {
    const lines = code
        .replace(/\n$/, '')
        .split('\n')
        .map((line, index) => {
            const highlightedLine = line ? highlightLine(line) : ' '

            return `<span class="code-line"><span class="line-number">${index + 1}</span><span class="line-code">${highlightedLine}</span></span>`
        })
        .join('')

    return `
    <div class="code-snippet" data-code="${escapeHTML(code.replace(/\n$/, ''))}">
        <div class="header">
            <div class="mac-dots">
                <span class="dot-red"></span>
                <span class="dot-yellow"></span>
                <span class="dot-green"></span>
            </div>
            <div class="filename">${filename}</div>
            <div class="label">${lang}</div>
            <button class="code-copy-btn" aria-label="Copy code">copy</button>
        </div>
        <div class="content">
            <pre><code class="hljs language-${lang}">${lines}</code></pre>
        </div>
    </div>
    `
}

const heroCode = `import { html, state, effect } from '@beforesemicolon/markup';

const [count, updateCount] = state(0);

const doubleCount = () => count() * 2;

effect(() => {
    console.log(count())
})

const countUp = () => updateCount(prev => prev + 1);
const countDown = () => updateCount(prev => prev - 1);

const App = html\`
  <h1>Conunter</h1>
  <p><strong>Current count</strong>: \${count}</p>
  <p><strong>Double count</strong>: \${doubleCount}</p>
  <button type="button" onclick="\${countDown}">-</button>
  <button type="button" onclick="\${countUp}">+</button>
\`;

App.render(document.getElementById('app'));`

const todoCode = `import { html, state, effect, repeat } from '@beforesemicolon/markup'

const [todos, setTodos] = state(
    JSON.parse(localStorage.getItem('todos') ?? '[]')
)

effect(() => {
    localStorage.setItem('todos', JSON.stringify(todos()))
})

const addTodo = () => {
    const text = window.prompt('What needs doing?')?.trim()

    if (text) setTodos((prev) => [...prev, { text, done: false }])
}

const toggle = (i) =>
    setTodos(todos().map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)))

html\`
    <button type="button" onclick="\${addTodo}">Add</button>
    <ul>
        \${repeat(
            todos,
            (todo, i) => html\`
                <li
                    class="\${todo.done ? 'done' : ''}"
                    onclick="\${() => toggle(i)}"
                >
                    \${todo.text}
                </li>
            \`
        )}
    </ul>
\`.render(document.querySelector('#app'))`

const buttonComponentCode = `import { WebComponent, html } from '@beforesemicolon/web-component'
import stylesheet from './button.css' with { type: 'css' }

class Button extends WebComponent {
    static observedAttributes = ['disabled', 'type']

    type = 'button'
    disabled = false

    stylesheet = stylesheet

    handleClick = (evt) => {
        evt.stopPropagation()
        this.dispatch('click')
    }

    render = () => {
        return html\`
            <button \${this.props} class="btn" onclick="\${this.handleClick}">
                <slot></slot>
            </button>
        \`
    }
}

customElements.define('bfs-button', Button)`

const suspenseCode = `import { html, suspense } from '@beforesemicolon/markup'

const loadUser = async () => {
    const res = await fetch('/api/me')
    return res.json()
}

const renderUser = async () => {
    const user = await loadUser()
    return html\`
        <article>
            <h2>\${user.name}</h2>
            <p>\${user.bio}</p>
        </article>
    \`
}

html\`
    <h1>Profile</h1>

    \${suspense(
        renderUser,
        html\`<p>Loading profile…</p>\`, // fallback
        (err) => html\`<p>Failed: \${err.message}</p>\` // catch
    )}
\`.render(document.querySelector('#app'))`

const routerCode = `<!-- in <head>:
<script src="https://unpkg.com/@beforesemicolon/router/dist/client.js"></script>
-->

<nav>
    <page-link path="/">Home</page-link>
    <page-link path="/about">About</page-link>
    <page-link path="/users">Users</page-link>
</nav>

<page-route path="/">
    <h1>Welcome home</h1>
</page-route>

<page-route path="/about" src="./pages/about.js"></page-route>

<page-route path="/users" exact="false">
    <page-route src="./pages/users.js"></page-route>
    <page-route path="/:userId" src="./pages/user.js"></page-route>
</page-route>

<page-route path="/404"> 404 - Page not found! </page-route>

<page-redirect path="/404" title="404 - Page not found!"></page-redirect>`

const lifecycleCode = `import { html, state } from '@beforesemicolon/markup';

const [seconds, setSeconds] = state(0);

html\`
  <p>Elapsed: \${seconds}s</p>
\`
  .onMount(() => {
    // runs once when attached to the DOM
    const id = setInterval(() => setSeconds(seconds() + 1), 1000);
    return () => clearInterval(id);
  })
  .onUpdate(() => {
    // runs every time a tracked value changes
    console.log('tick', seconds());
  })
  .render(document.querySelector('#app'));`

export default (props) => {
    return `
<!doctype html>
<html lang="en">
    <head>
        ${meta(props)}
        <link rel="stylesheet" href="/stylesheets/landing.css?v=20260621exact">
    </head>
    <body>
        ${header(props)}
        
        <!-- Hero Section -->
        <section class="hero-section relative overflow-hidden">
            <div class="absolute inset-0 bg-grid pointer-events-none"></div>
            <div class="absolute inset-0 hero-glow pointer-events-none animate-pulse-glow"></div>
            <div class="wrapper hero-container animate-float-up">
                <div class="hero-content">
                    <a href="https://github.com/beforesemicolon/markup" target="_blank" rel="noopener" class="version-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sparkles-icon"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
                        <span>v${pkg.version}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                    <h1 class="hero-title">
                        <span class="text-gradient">Reactive DOM.</span><br/>
                        <span class="text-gradient-primary">Zero build.</span>
                    </h1>
                    <p class="hero-subtitle">
                        A tiny, web-standards-first templating system that brings reactivity, state, and components to vanilla JavaScript. <strong>No bundlers. No JSX. No magic.</strong>
                    </p>
                    <div class="hero-actions">
                        <a href="/documentation/get-started" class="btn-primary">
                            <span>Get Started</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </a>
                        <a href="#install" class="btn-secondary font-mono">
                            npm i @beforesemicolon/markup
                        </a>
                    </div>
                    <div class="hero-stats">
                        <div class="stat-item">
                            <span class="stat-value text-gradient-primary">7.6KB</span>
                            <span class="stat-label">CDN gzip</span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <span class="stat-value text-gradient-primary">0</span>
                            <span class="stat-label">third-party deps</span>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="stat-item">
                            <span class="stat-value text-gradient-primary">100%</span>
                            <span class="stat-label">web standards</span>
                        </div>
                    </div>
                </div>
                <div class="hero-code-panel">
                    <div class="glow-container">
                        <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl rounded-full"></div>
                    </div>
                    ${renderCodeBlock('counter.js', heroCode)}
                </div>
            </div>
        </section>

        <!-- Products/Ecosystem Section -->
        <section class="products-section wrapper">
            <div class="section-header">
                <div>
                    <span class="section-tag font-mono">// the ecosystem</span>
                    <h2>Built on top of Markup.</h2>
                </div>
                <p>Production-ready libraries powered by the same reactive engine — opt-in, modular, and free of third-party runtime dependencies.</p>
            </div>
            <div class="products-grid">
                <div class="product-card card-orange">
                    <div class="product-glow"></div>
                    <a href="https://markup.beforesemicolon.com/documentation/capabilities/web-component" target="_blank" rel="noreferrer" class="product-head">
                        <div class="product-title-row">
                            <div class="icon-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5Z"/></svg>
                            </div>
                            <div>
                                <h3>Web Components</h3>
                                <span class="package-name font-mono">@beforesemicolon/web-component</span>
                            </div>
                        </div>
                        <span class="product-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                        </span>
                    </a>
                    <p>A reactive layer over the native Web Components API. Props, state, lifecycles, scoped styles — built on Markup.</p>
                    <a href="https://markup.beforesemicolon.com/documentation/capabilities/web-component" target="_blank" rel="noreferrer" class="product-link">
                        <span>Read the docs</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                    </a>
                </div>
                <div class="product-card card-cyan">
                    <div class="product-glow"></div>
                    <a href="https://markup.beforesemicolon.com/documentation/capabilities/router" target="_blank" rel="noreferrer" class="product-head">
                        <div class="product-title-row">
                            <div class="icon-container">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 3.5-3.5V8.5a3.5 3.5 0 0 0-3.5-3.5H9"/></svg>
                            </div>
                            <div>
                                <h3>Router</h3>
                                <span class="package-name font-mono">@beforesemicolon/router</span>
                            </div>
                        </div>
                        <span class="product-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                        </span>
                    </a>
                    <p>Declarative routing as web component tags. Nested routes, query matching, lazy-loaded pages — zero JavaScript required.</p>
                    <a href="https://markup.beforesemicolon.com/documentation/capabilities/router" target="_blank" rel="noreferrer" class="product-link">
                        <span>Read the docs</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                    </a>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="features-section wrapper">
            <div class="section-header">
                <span class="section-tag font-mono">// why markup</span>
                <h2>The platform is the framework.</h2>
                <p>Web Standards, Web APIs, and modern JavaScript are all you need. Markup just adds the reactivity.</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-border"></div>
                    <div class="icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <h3>Reactive</h3>
                    <p>Template literals and functions create reactive DOM with state, lifecycles, and side-effects.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-border"></div>
                    <div class="icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>
                    </div>
                    <h3>Tiny — under 8KB gzip</h3>
                    <p>The CDN browser build transfers at about 7.6KB gzip. Ship enterprise apps without a megabyte of framework.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-border"></div>
                    <div class="icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.3 10a3.5 3.5 0 0 1 0-7h7.4a3.5 3.5 0 0 1 0 7H8.3Z"/><path d="M12 14a3 3 0 0 1 3-3h3.5a3 3 0 0 1 3 3v3.5a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V14Z"/><path d="M2 14.5a3.5 3.5 0 0 1 7 0v2.8a3.5 3.5 0 0 1-7 0v-2.8Z"/></svg>
                    </div>
                    <h3>Web Standards</h3>
                    <span class="hide-element"></span>
                    <p>Three simple APIs that extend the platform you already know. No proprietary abstractions.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-border"></div>
                    <div class="icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8H6v5a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4Z"/></svg>
                    </div>
                    <h3>Plug & Play</h3>
                    <p>Drop in a script tag and go. No build step, no JSX, no configuration files.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-border"></div>
                    <div class="icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5Z"/></svg>
                    </div>
                    <h3>Web Components</h3>
                    <p>Supercharge native Web Components with reactivity. Skip manual DOM manipulation.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-border"></div>
                    <div class="icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                    </div>
                    <h3>Surgical Updates</h3>
                    <p>Data-driven rendering means the DOM updates only where and when it actually needs to.</p>
                </div>
            </div>
        </section>

        <!-- Showcase Section -->
        <section id="code" class="showcase-section relative overflow-hidden">
            <div class="absolute inset-0 showcase-glow pointer-events-none"></div>
            <div class="wrapper relative">
                <div class="showcase-header">
                    <div class="showcase-header-text">
                        <span class="section-tag font-mono">// see it in action</span>
                        <h2>Looks like HTML. Feels like magic.</h2>
                        <p>Reactive state, component composition, and lifecycle — all from the JavaScript primitives you already know.</p>
                    </div>
                    <div class="slider-controls">
                        <button id="slider-prev" aria-label="Previous example" class="ctrl-btn btn-prev">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                        </button>
                        <button id="slider-next" aria-label="Next example" class="ctrl-btn btn-next">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>

                <div class="slider-viewport">
                    <div class="slider-track">
                        <div class="slider-slide">
                            <div class="slide-meta">
                                <span class="slide-num font-mono">EXAMPLE 01</span>
                                <div class="slide-line"></div>
                                <span class="slide-label font-mono color-orange">Todos + localStorage</span>
                            </div>
                            ${renderCodeBlock('todos.js', todoCode)}
                        </div>
                        <div class="slider-slide">
                            <div class="slide-meta">
                                <span class="slide-num font-mono">EXAMPLE 02</span>
                                <div class="slide-line"></div>
                                <span class="slide-label font-mono color-cyan">Button component using WebComponent</span>
                            </div>
                            ${renderCodeBlock('button-component.js', buttonComponentCode)}
                        </div>
                        <div class="slider-slide">
                            <div class="slide-meta">
                                <span class="slide-num font-mono">EXAMPLE 03</span>
                                <div class="slide-line"></div>
                                <span class="slide-label font-mono color-orange">Suspense (async)</span>
                            </div>
                            ${renderCodeBlock('profile.js', suspenseCode)}
                        </div>
                        <div class="slider-slide">
                            <div class="slide-meta">
                                <span class="slide-num font-mono">EXAMPLE 04</span>
                                <div class="slide-line"></div>
                                <span class="slide-label font-mono color-cyan">Page routing</span>
                            </div>
                            ${renderCodeBlock('app.html', routerCode, 'html')}
                        </div>
                        <div class="slider-slide">
                            <div class="slide-meta">
                                <span class="slide-num font-mono">EXAMPLE 05</span>
                                <div class="slide-line"></div>
                                <span class="slide-label font-mono color-orange">Template lifecycles</span>
                            </div>
                            ${renderCodeBlock('timer.js', lifecycleCode)}
                        </div>
                    </div>
                </div>

                <div class="slider-dots-container">
                    <button class="slider-dot active" aria-label="Go to slide 1"></button>
                    <button class="slider-dot" aria-label="Go to slide 2"></button>
                    <button class="slider-dot" aria-label="Go to slide 3"></button>
                    <button class="slider-dot" aria-label="Go to slide 4"></button>
                    <button class="slider-dot" aria-label="Go to slide 5"></button>
                </div>
            </div>
        </section>

        <!-- Install Section -->
        <section id="install" class="install-section wrapper">
            <div class="install-container">
                <div class="section-header center">
                    <span class="section-tag font-mono">// quick start</span>
                    <h2>Install in seconds.</h2>
                    <p>Pick your weapon. Markup works everywhere JavaScript runs.</p>
                </div>

                <div class="tabs-container">
                    <div class="tabs-list">
                        <button class="tab-trigger" data-tab="cdn">CDN</button>
                        <button class="tab-trigger active" data-tab="npm">npm</button>
                        <button class="tab-trigger" data-tab="yarn">yarn</button>
                        <button class="tab-trigger" data-tab="pnpm">pnpm</button>
                    </div>
                    <div class="tabs-content-wrapper">
                        <div class="tab-content" id="tab-cdn">
                            <div class="install-code-row" data-code="&lt;script src=&quot;https://unpkg.com/@beforesemicolon/markup/dist/client.js&quot;&gt;&lt;/script&gt;">
                                <div class="install-command">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                                    <code class="font-mono">&lt;script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"&gt;&lt;/script&gt;</code>
                                </div>
                                <button class="install-copy-btn" aria-label="Copy CDN install command">
                                    <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                    <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                        <div class="tab-content active" id="tab-npm">
                            <div class="install-code-row" data-code="npm install @beforesemicolon/markup">
                                <div class="install-command">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                                    <code class="font-mono">npm install @beforesemicolon/markup</code>
                                </div>
                                <button class="install-copy-btn" aria-label="Copy npm install command">
                                    <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                    <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                        <div class="tab-content" id="tab-yarn">
                            <div class="install-code-row" data-code="yarn add @beforesemicolon/markup">
                                <div class="install-command">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                                    <code class="font-mono">yarn add @beforesemicolon/markup</code>
                                </div>
                                <button class="install-copy-btn" aria-label="Copy yarn install command">
                                    <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                    <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                        <div class="tab-content" id="tab-pnpm">
                            <div class="install-code-row" data-code="pnpm add @beforesemicolon/markup">
                                <div class="install-command">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                                    <code class="font-mono">pnpm add @beforesemicolon/markup</code>
                                </div>
                                <button class="install-copy-btn" aria-label="Copy pnpm install command">
                                    <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                    <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section wrapper">
            <div class="cta-card">
                <div class="cta-glow"></div>
                <h2>
                    <span class="text-gradient">Build the Web,</span>
                    <span class="text-gradient-primary">your way.</span>
                </h2>
                <p>Join developers shipping faster with a framework that respects the platform — and your time.</p>
                <div class="cta-buttons">
                    <a href="/documentation/get-started" class="btn-primary">
                        <span>Get Started</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                        <a href="/documentation/index.html?v=20260621exact" class="btn-outline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        <span>Read the Docs</span>
                    </a>
                </div>
            </div>
        </section>
        
        ${footer()}
        
        ${copyCode()}

        <!-- Slider and Tabs Scripts -->
        <script type="application/javascript">
            // Custom vanilla slider implementation
            (function() {
                const track = document.querySelector('.slider-track');
                const originalSlides = Array.from(document.querySelectorAll('.slider-slide'));
                const dots = document.querySelectorAll('.slider-dot');
                const btnPrev = document.getElementById('slider-prev');
                const btnNext = document.getElementById('slider-next');
                const slideCount = originalSlides.length;
                let currentIndex = 1;
                let logicalIndex = 0;

                if (track && slideCount > 1) {
                    const firstClone = originalSlides[0].cloneNode(true);
                    const lastClone = originalSlides[slideCount - 1].cloneNode(true);
                    firstClone.setAttribute('aria-hidden', 'true');
                    lastClone.setAttribute('aria-hidden', 'true');
                    track.insertBefore(lastClone, originalSlides[0]);
                    track.appendChild(firstClone);
                }

                const slides = Array.from(document.querySelectorAll('.slider-slide'));

                function setTrack(index, animate = true) {
                    const slide = slides[index];
                    const offset = slide ? slide.offsetLeft : 0;
                    track.style.transition = animate
                        ? 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
                        : 'none';
                    track.style.transform = 'translateX(-' + offset + 'px)';
                }

                function updateDots(index) {
                    logicalIndex = ((index % slideCount) + slideCount) % slideCount;
                    dots.forEach((dot, idx) => {
                        if (idx === logicalIndex) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    });
                }

                function updateSlider(index, animate = true) {
                    currentIndex = index;
                    setTrack(currentIndex, animate);
                    updateDots(currentIndex - 1);
                }

                if (btnPrev && btnNext && track) {
                    btnPrev.addEventListener('click', () => updateSlider(currentIndex - 1));
                    btnNext.addEventListener('click', () => updateSlider(currentIndex + 1));
                    track.addEventListener('transitionend', () => {
                        if (currentIndex === 0) {
                            currentIndex = slideCount;
                            setTrack(currentIndex, false);
                        } else if (currentIndex === slideCount + 1) {
                            currentIndex = 1;
                            setTrack(currentIndex, false);
                        }
                    });

                    dots.forEach((dot, idx) => {
                        dot.addEventListener('click', () => updateSlider(idx + 1));
                    });

                    updateSlider(currentIndex, false);
                    window.addEventListener('resize', () => updateSlider(currentIndex, false));
                }

                // Tabs Switcher
                const tabTriggers = document.querySelectorAll('.tab-trigger');
                const tabContents = document.querySelectorAll('.tab-content');
                const installCopyButtons = document.querySelectorAll('.install-copy-btn');

                tabTriggers.forEach(trigger => {
                    trigger.addEventListener('click', () => {
                        const targetTab = trigger.getAttribute('data-tab');

                        tabTriggers.forEach(t => t.classList.remove('active'));
                        tabContents.forEach(c => c.classList.remove('active'));

                        trigger.classList.add('active');
                        const activeContent = document.getElementById('tab-' + targetTab);
                        if (activeContent) activeContent.classList.add('active');
                    });
                });

                installCopyButtons.forEach(button => {
                    button.addEventListener('click', async () => {
                        const row = button.closest('.install-code-row');
                        const value = row ? row.getAttribute('data-code') : '';
                        try {
                            await navigator.clipboard.writeText(value);
                            button.classList.add('copied');
                            button.querySelector('span').textContent = 'Copied';
                            setTimeout(() => {
                                button.classList.remove('copied');
                                button.querySelector('span').textContent = 'Copy';
                            }, 1500);
                        } catch {}
                    });
                });
            })();
        </script>
        
    </body>
</html>
`
}
