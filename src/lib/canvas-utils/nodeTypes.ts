import type { FlowNode, HandleId, HandleType, NodeOption } from "../../types";

export interface DraggableNodeProps {
	node: FlowNode;
	zoom: number;
}

export interface HandleDef {
	type: HandleType;
	position: HandleId;
	className: string;
}

export interface NodeHandleProps {
	nodeId: string;
	type: HandleType;
	position: HandleId;
	className: string;
	optionId?: string;
}

export interface NodeOptionsListProps {
	nodeId: string;
	options: NodeOption[];
}
