import {html} from "./html";
import {repeat, when} from "./helpers";

if (window) {
	// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		html,
		repeat,
		when
	}
	
}
