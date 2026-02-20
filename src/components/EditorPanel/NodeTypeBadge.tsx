import { cn } from "../../lib/utils";
import type { FlowNode } from "../../types";

interface NodeTypeBadgeProps {
	node: FlowNode;
}

export function NodeTypeBadge({ node }: Readonly<NodeTypeBadgeProps>) {
	return (
		<div className="flex items-center gap-2">
			<span
				className={cn(
					"text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md",
					node.type === "choice"
						? "bg-accent-choice-bg text-accent-choice"
						: "bg-accent-message-bg text-accent-message",
				)}
			>
				{node.type}
			</span>
			<span className="text-xs text-text-muted font-mono truncate">
				{node.id}
			</span>
		</div>
	);
}
