import {Template} from "../types";

export const when = (condition: boolean | (() => boolean), yes: Template | string, no: Template | string = "") => {
	return () => {
		const render = typeof condition === "function" ? condition() : condition;
		return render ? yes : no;
	}
}
