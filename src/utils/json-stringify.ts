import {isPrimitive} from "./is-primitive";

export function jsonStringify(value: any): any {
	if (!isPrimitive(value)) {
		try {
			value = JSON.stringify(value);
		} catch (e) {
		}
	}

	return String(value);
}
