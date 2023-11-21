import { html } from '../../src'
import social from '../data/social.json'

interface FooterProps {
    basePath?: string
}

export const Footer = ({ basePath = '.' }: FooterProps = {}) => {
    return html`
        <footer class="wrapper">
            <img
                id="footer-markup-logo"
                src="${basePath}assets/markup-logo-name.svg"
                alt="Markup logo"
                width="auto"
                height="30"
            />
            <ul class="learning-resources">
                <li><h4>Learning Resources</h4></li>
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
                <li>
                    <h4>About <em>Before Semicolon</em></h4>
                </li>
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
                    width="20"
                    height="20"
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
