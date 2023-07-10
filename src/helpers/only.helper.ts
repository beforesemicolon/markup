export const only = (condition: boolean | (() => boolean), yes: unknown, no = "") => {
	return () => {
		const render = typeof condition === "boolean" ? condition : condition();
		
		return render ? yes : no;
	}
}
