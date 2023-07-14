type DataGetter<T> = () => number | Array<T>;
type RepeatHelperData<T> = number | Array<T> | DataGetter<T>

export const repeat = <T>(data: RepeatHelperData<T>, cb: (data: T, index: number) => unknown) => {
	const listMap: Map<T, unknown> = new Map();
	
	const each = (d: T, i: number) => {
		if (!listMap.has(d)) {
			listMap.set(d, cb(d, i));
		}
		
		return listMap.get(d);
	}
	
	const dataIsFn = typeof data === "function";
	const fn = dataIsFn ? data as DataGetter<T> : () => [];
	
	return () => {
		if (dataIsFn) {
			data = fn();
		}
		
		if (typeof data === "number") {
			return Array.from({length: data}, (_, i) => each((i + 1) as T, i)) as Array<T>;
		}
		
		return (data as T[]).map(each);
	}
}
