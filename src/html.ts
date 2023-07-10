import {HTMLRenderTemplate} from "./HTMLRenderTemplate";

/**
 * html template literal tag function
 * @param parts
 * @param values
 */
export const html = (parts: TemplateStringsArray, ...values: unknown[]): HTMLRenderTemplate => {
	return new HTMLRenderTemplate(parts, values)
}
