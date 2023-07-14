import {Template} from "../types";
import {jsonStringify} from "../utils/json-stringify";

type DataGetter<T> = () => number | Array<T>;
type RepeatHelperData<T> = number | Array<T> | DataGetter<T>

export const repeat = <T>(data: RepeatHelperData<T>, cb: (data: T, index: number) => Template | unknown) => {
	const listMap: Map<T, unknown> = new Map();
	
	const each = (d: T, i: number) => {
		const dStr = jsonStringify(d);

		if (!listMap.has(dStr)) {
			listMap.set(dStr, cb(d, i));
		}
		
		return listMap.get(dStr);
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
