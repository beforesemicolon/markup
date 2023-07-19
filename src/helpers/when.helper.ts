export const when = (condition: unknown | (() => unknown), thenThis: unknown | (() => unknown), elseThat?: unknown | (() => unknown)) => {
	return () => {
		return Boolean(typeof condition === "function" ? condition() : condition)
			? (typeof thenThis === "function" ? thenThis() : thenThis)
			: (elseThat === null || elseThat === undefined ? "" : typeof elseThat === "function" ? elseThat() : elseThat);
	}
}
