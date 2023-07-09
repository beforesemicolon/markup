import {HTMLRenderTemplate} from "./HTMLRenderTemplate";

export const html = (parts: TemplateStringsArray, ...values: unknown[]): HTMLRenderTemplate => {
	return new HTMLRenderTemplate(parts, values)
}
