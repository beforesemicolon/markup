export const when = (condition: unknown | (() => unknown), thenThis: unknown | (() => unknown), elseThat?: unknown | (() => unknown)) => {
	return () => {
		const shouldRender = Boolean(typeof condition === "function" ? condition() : condition);
		
		if (shouldRender) {
			return (typeof thenThis === "function" ? thenThis() : thenThis) ?? '';
		}
		
		return (typeof elseThat === "function" ? elseThat() : elseThat) ?? '';
	}
}
