import { html } from '../../src'
import social from '../data/social.json'

interface FooterProps {
    basePath?: string
}

export const Footer = ({ basePath = './' }: FooterProps = {}) => {
    return html`
        <footer class="wrapper">
            <ul class="learning-resources">
                <h5>Learning Resources</h5>
                <li><a href="${basePath}documentation">Documentation</a></li>
                <li>
                    <a href="${basePath}documentation/essential-training"
                        >Essential Training</a
                    >
                </li>
                <li>
                    <a href="${basePath}documentation/tutorial">Tutorial</a>
                </li>
                <li>
                    <a href="${basePath}documentation/examples">Examples</a>
                </li>
            </ul>
            <ul class="about-bfs">
                <h5>About <em>Before Semicolon</em></h5>
                <li>
                    <a
                        href="https://github.com/beforesemicolon"
                        rel="noopener"
                        target="_blank"
                        >Open Source</a
                    >
                </li>
                <li>
                    <a
                        href="https://beforesemicolon.com/"
                        rel="noopener"
                        target="_blank"
                        >Website</a
                    >
                </li>
                <li>
                    <a
                        href="https://medium.com/before-semicolon"
                        rel="noopener"
                        target="_blank"
                        >Blog</a
                    >
                </li>
                <li>
                    <a
                        href="https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw"
                        rel="noopener"
                        target="_blank"
                        >YouTube Channel</a
                    >
                </li>
                <li>
                    <address aria-label="social-media">
                        ${social.map(
                            (s) => html`
                                <a
                                    href="${s.link}"
                                    rel="noopener"
                                    target="_blank"
                                >
                                    <img
                                        src="${basePath}${s.icon}"
                                        alt="${s.name}"
                                        width="20"
                                    />
                                </a>
                            `
                        )}
                    </address>
                </li>
            </ul>
            <div class="copyright">
                <img
                    src="${basePath}assets/before-semicolon-logo.png"
                    alt="Before Semicolon logo"
                />
                <p>
                    <small>
                        Copyright © ${new Date().getFullYear()} Before
                        Semicolon. All rights reserved.
                    </small>
                </p>
            </div>
        </footer>
    `
}
