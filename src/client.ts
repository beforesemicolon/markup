import {html} from "./html";
import {repeat, only} from "./helpers";

if (window) {
	// @ts-ignore
	if (!window.BFS) {
		// @ts-ignore
		window.BFS = {}
	}
	
	// @ts-ignore
	window.BFS['html'] = html;
	// @ts-ignore
	window.BFS['repeat'] = repeat;
	// @ts-ignore
	window.BFS['only'] = only;
	
}
