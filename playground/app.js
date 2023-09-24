import {Button} from "./components/forms/button.js";

const {html, when, repeat, element, useValue} = window.BFS;

const App = () => {
  return html`
    <h2>Forms</h2>
    <section>
	    <h3>Size</h3>
	    ${Button({size: "large"})}
	    ${Button()}
	    ${Button({size: "small"})}
    </section>
    <section>
	    <h3>Variant</h3>
	    ${Button({variant: "cta"})}
	    ${Button({variant: "outline"})}
	    ${Button({variant: "text"})}
    </section>
  `;
}

App().render(document.getElementById('app'));
