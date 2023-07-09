import {html} from "./html";

if (window) {
	// @ts-ignore
	if (!window.BFS) {
		// @ts-ignore
		window.BFS = {}
	}
	
	// @ts-ignore
	window.BFS['html'] = html;
	
}
