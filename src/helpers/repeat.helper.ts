type DataGetter<T> = () => number | Array<T>;
type RepeatHelperData<T> = number | Array<T> | DataGetter<T>

export const repeat = <T>(data: RepeatHelperData<T>, cb: (data: T, index: number) => unknown) => {
	const dataIsFn = typeof data === "function";
	const fn = dataIsFn ? data as DataGetter<T> : () => [];
	
	if (dataIsFn) {
		data = fn();
	}
	
	if(typeof data === "number") {
		data = Array.from({length: data}, (_, i) => i + 1) as Array<T>;
	}
	
	const listMap = (data as Array<T>).reduce((acc, d, i) => {
		acc.set(d, cb(d, i));
		return acc;
	}, new Map());
	
	const each = (d: T, i: number) => {
		if(!listMap.has(d)) {
			listMap.set(d, cb(d, i));
		}
		
		return listMap.get(d);
	}
	
	return () => ((dataIsFn ? fn() : data) as Array<T>).map(each);
}
