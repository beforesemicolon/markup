export interface ExecutableValue {
	type: "attr-dir" | "attr-value" | "text" | "event",
	name: string;
	rawValue: string;
	value: unknown;
	renderedNode: Node | Node[];
	parts: unknown[];
	prop?: string;
}

export interface Executable {
	node: Node;
	values: ExecutableValue[];
	subExecutables: Executable[];
}
