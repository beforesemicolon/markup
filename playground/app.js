import './components/forms/action-button.js'
import './components/forms/download-button.js'
import './components/forms/upload-button.js'
import './components/forms/text-field.js'
import './components/forms/email-field.js'
import './components/forms/search-field.js'
import './components/forms/url-field.js'
import './components/forms/number-field.js'
import './components/forms/radio-button.js'
import './components/forms/check-box.js'
import './components/forms/toggle-button.js'
import './components/forms/field-label.js'
import './components/forms/selector-field.js'
import './components/icons/check-icon.js'
import './components/icons/upload-icon.js'
import './components/icons/download-icon.js'

const { html, state, repeat } = window.BFS

const App = () => {
    return html`
        <h2>Icons</h2>
        <section>
            <div>
                <check-icon></check-icon>
                <download-icon></download-icon>
                <upload-icon></upload-icon>
            </div>
        </section>
        <h2>Text</h2>
        <h2>Form</h2>
        <section>
            <h3>Text Field</h3>
            <div>
                <text-field placeholder="text"></text-field>
                <text-field placeholder="text" disabled></text-field>
                <text-field placeholder="text" readonly></text-field>
            </div>
            <div>
                <text-field placeholder="text" multiline></text-field>
                <text-field
                    placeholder="text"
                    multiline
                    width="200px"
                    resize="none"
                    rows="2"
                ></text-field>
            </div>
        </section>
        <section>
            <h3>Email Field</h3>
            <div>
                <email-field placeholder="email"></email-field>
                <email-field placeholder="email" disabled></email-field>
                <email-field placeholder="email" readonly></email-field>
            </div>
        </section>
        <section>
            <h3>Url Field</h3>
            <div>
                <url-field placeholder="url"></url-field>
                <url-field placeholder="url" disabled></url-field>
                <url-field placeholder="url" readonly></url-field>
            </div>
        </section>
        <section>
            <h3>Search Field</h3>
            <div>
                <search-field placeholder="search"></search-field>
                <search-field placeholder="search" disabled></search-field>
                <search-field placeholder="search" readonly></search-field>
            </div>
        </section>
        <section>
            <h3>Icons</h3>
            <div>
                <check-icon></check-icon>
                <download-icon></download-icon>
                <upload-icon></upload-icon>
            </div>
        </section>
        <section>
            <h3>Icon Buttons</h3>
            <div>
                <action-button variant="icon">
                    <check-icon color="#fff"></check-icon>
                </action-button>
                <action-button variant="outline icon">
                    <check-icon color="#222"></check-icon>
                </action-button>
                <action-button variant="cta icon">
                    <check-icon color="#fff"></check-icon>
                </action-button>
                <action-button variant="text icon">
                    <check-icon color="#222"></check-icon>
                </action-button>
            </div>
        </section>
        <section>
            <h3>Selector</h3>
            <div>
                <selector-field
                    onchange="${console.log}"
                    value="1"
                    options='[{"value": 1, "label": "One"}, {"value": 2, "label": "Two"}]'
                ></selector-field>
            </div>
        </section>
        <section>
            <h3>Button</h3>
            <div>
                <action-button size="small">Click Me</action-button>
                <action-button onclick="${console.log}">Click Me</action-button>
                <action-button size="large">Click Me</action-button>
            </div>
            <div>
                <action-button variant="cta" size="small"
                    >Click Me</action-button
                >
                <action-button variant="cta" onclick="${console.log}"
                    >Click Me</action-button
                >
                <action-button variant="cta" size="large"
                    >Click Me</action-button
                >
            </div>
            <div>
                <action-button variant="outline" size="small"
                    >Click Me</action-button
                >
                <action-button variant="outline" onclick="${console.log}"
                    >Click Me</action-button
                >
                <action-button variant="outline" size="large"
                    >Click Me</action-button
                >
            </div>
            <div>
                <action-button variant="text" size="small"
                    >Click Me</action-button
                >
                <action-button variant="text" onclick="${console.log}"
                    >Click Me</action-button
                >
                <action-button variant="text" size="large"
                    >Click Me</action-button
                >
            </div>
        </section>
        <section>
            <h3>Download Button</h3>
            <div>
                <download-button
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="small"
                    >Save</download-button
                >
                <download-button
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    onclick="${console.log}"
                    >Save</download-button
                >
                <download-button
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="large"
                    >Save</download-button
                >
            </div>
            <div>
                <download-button
                    variant="cta"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="small"
                    >Save</download-button
                >
                <download-button
                    variant="cta"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    onclick="${console.log}"
                    >Save</download-button
                >
                <download-button
                    variant="cta"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="large"
                    >Save</download-button
                >
            </div>
            <div>
                <download-button
                    variant="outline"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="small"
                    >Save</download-button
                >
                <download-button
                    variant="outline"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    onclick="${console.log}"
                    >Save</download-button
                >
                <download-button
                    variant="outline"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="large"
                    >Save</download-button
                >
            </div>
            <div>
                <download-button
                    variant="text"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="small"
                    >Save</download-button
                >
                <download-button
                    variant="text"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    onclick="${console.log}"
                    >Save</download-button
                >
                <download-button
                    variant="text"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="large"
                    >Save</download-button
                >
            </div>
        </section>
        <section>
            <h3>Upload Button</h3>
            <div>
                <upload-button
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="small"
                    >Upload</upload-button
                >
                <upload-button
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    onfiles="${console.log}"
                    >Upload</upload-button
                >
                <upload-button
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="large"
                    >Upload</upload-button
                >
            </div>
            <div>
                <upload-button
                    multiple
                    type="image/*"
                    variant="cta"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="small"
                    >Upload</upload-button
                >
                <upload-button
                    multiple
                    type="image/*"
                    variant="cta"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    onfiles="${console.log}"
                    >Upload</upload-button
                >
                <upload-button
                    multiple
                    type="image/*"
                    variant="cta"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="large"
                    >Upload</upload-button
                >
            </div>
            <div>
                <upload-button
                    type="audio/*"
                    variant="outline"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="small"
                    >Upload</upload-button
                >
                <upload-button
                    type="audio/*"
                    variant="outline"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    onfiles="${console.log}"
                    >Upload</upload-button
                >
                <upload-button
                    type="audio/*"
                    variant="outline"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="large"
                    >Upload</upload-button
                >
            </div>
            <div>
                <upload-button
                    type=".pdf"
                    variant="text"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="small"
                    >Upload</upload-button
                >
                <upload-button
                    type=".pdf"
                    variant="text"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    onfiles="${console.log}"
                    >Upload</upload-button
                >
                <upload-button
                    type=".pdf"
                    variant="text"
                    src="https://beforesemicolon.com/assets/before-semicolon-logo.png"
                    size="large"
                    >Upload</upload-button
                >
            </div>
        </section>
        <section>
            <h3>Radio Button</h3>
            <div>
                <radio-button size="small"></radio-button>
                <radio-button checked="true"></radio-button>
                <radio-button size="large"></radio-button>
            </div>
        </section>
        <section>
            <h3>Check Box</h3>
            <div>
                <check-box size="small"></check-box>
                <check-box checked="true"></check-box>
                <check-box size="large"></check-box>
            </div>
        </section>
        <section>
            <h3>Toggle Button</h3>
            <div>
                <toggle-button size="small"></toggle-button>
                <toggle-button
                    oncheck="${console.log}"
                    checked="true"
                ></toggle-button>
                <toggle-button size="large"></toggle-button>
            </div>
        </section>
        <section>
            <h3>Field Label</h3>
            <div>
                <field-label size="small" text="field name:">
                    <div
                        style="height: 30px; width: 200px; background-color: #ddd; margin: 0;"
                    ></div>
                </field-label>
            </div>
            <div>
                <field-label text="field name:" position="top" variant="info">
                    <div
                        style="height: 30px; width: 200px; background-color: #ddd; margin: 0;"
                    ></div>
                </field-label>
            </div>
            <div>
                <field-label
                    text="field name:"
                    position="bottom"
                    variant="error"
                >
                    <div
                        style="height: 30px; width: 200px; background-color: #ddd; margin: 0;"
                    ></div>
                </field-label>
            </div>
            <div>
                <field-label text=":field name" position="right">
                    <div
                        style="height: 30px; width: 200px; background-color: #ddd; margin: 0;"
                    ></div>
                </field-label>
            </div>
        </section>
        <h2>Layout</h2>
        <h2>Media</h2>
        <h2>Menu</h2>
        <h2>Graph</h2>
    `
}

App().render(document.getElementById('app'))
