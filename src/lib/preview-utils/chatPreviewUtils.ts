import type { FlowConnection, FlowNode } from "../../types";

export function getTypingDelay(content: string): number {
	return Math.min(600 + content.length * 8, 1500);
}

export function findRootNode(
	nodes: FlowNode[],
	connections: FlowConnection[],
): FlowNode | null {
	if (nodes.length === 0) return null;
	const targetIds = new Set(
		connections.map((connection) => connection.targetId),
	);
	return nodes.find((node) => !targetIds.has(node.id)) ?? nodes[0];
}

export function findNextMessageNode(
	nodeId: string,
	nodes: FlowNode[],
	connections: FlowConnection[],
): FlowNode | null {
	const connection = connections.find((c) => c.sourceId === nodeId);
	if (!connection) return null;
	return nodes.find((n) => n.id === connection.targetId) ?? null;
}
