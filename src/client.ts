import {html} from "./html";
import {HTMLRenderTemplate} from "./HTMLRenderTemplate";

if (window) {
	// @ts-ignore
	if (!window.BFS) {
		// @ts-ignore
		window.BFS = {}
	}
	
	// @ts-ignore
	window.BFS['html'] = html;
	// @ts-ignore
	window.BFS['HTMLRenderTemplate'] = HTMLRenderTemplate;
	
}
