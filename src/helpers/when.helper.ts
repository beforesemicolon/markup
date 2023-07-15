export const when = (condition: boolean | (() => boolean), yes: unknown, no: unknown = "") => {
	return () => {
		const render = typeof condition === "function" ? condition() : condition;
		return render ? yes : no;
	}
}
