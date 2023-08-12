import {html} from "./html";
import {repeat, when, element} from "./helpers";

if (window) {
	// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		html,
		repeat,
		when,
		element
	}
	
}
