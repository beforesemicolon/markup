export const when = (condition: unknown | (() => unknown), thenThis: unknown | (() => unknown), elseThat?: unknown | (() => unknown)) => {
	let truthValue: unknown = null;
	let truthValueSet = false;
	let falseValue: unknown = null;
	let falseValueSet = false;
	
	return () => {
		const shouldRender = Boolean(typeof condition === "function" ? condition() : condition);
		
		if (shouldRender) {
			if (!truthValueSet) {
				truthValue = typeof thenThis === "function" ? thenThis() : thenThis;
				truthValueSet = true;
			}
			
			return truthValue;
		}
		
		if (!falseValueSet) {
			falseValue = elseThat === null || elseThat === undefined
				? ""
				: typeof elseThat === "function"
					? elseThat()
					: elseThat;
			falseValueSet = true;
		}
		
		return falseValue;
	}
}
