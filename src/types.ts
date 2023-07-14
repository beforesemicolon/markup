export interface ExecutableValue {
	type: "attr-dir" | "attr-value" | "text" | "event",
	name: string;
	rawValue: string;
	value: unknown;
	renderedNode: Node | Node[];
	prop?: string;
}

export interface Executable {
	node: Node;
	values: ExecutableValue[];
	subExecutables: Executable[];
}


export interface Template {
	readonly refs: Record<string, Element>;
	readonly renderTarget: ShadowRoot | HTMLElement | null;
	readonly htmlTemplate: string;
	nodes: Node[];
	render: (elementToAttachNodesTo: ShadowRoot | HTMLElement, force?: boolean) => void;
	update: () => void;
}
