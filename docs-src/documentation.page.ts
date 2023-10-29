import { html } from '../src'
import { PageLayout } from './partials/page-layout'

export default PageLayout({
    title: 'Tutorial - HTML Templating System - Before Semicolon',
    stylesheets: html` <link rel="stylesheet" href="./documentation.css" /> `,
    content: html``,
})
