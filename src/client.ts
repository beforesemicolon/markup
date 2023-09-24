import {html, useValue} from "./html";
import {repeat, when, element} from "./helpers";

// @ts-ignore
if (window) {
	// @ts-ignore
	window.BFS = {
		// @ts-ignore
		...(window.BFS || {}),
		html,
		repeat,
		when,
		element,
		useValue
	}
}
