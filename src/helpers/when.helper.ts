import {Template} from "../types";

export const when = (condition: boolean | (() => boolean), yes: Template | unknown, no: Template | unknown = "") => {
	return () => {
		const render = typeof condition === "function" ? condition() : condition;
		return render ? yes : no;
	}
}
