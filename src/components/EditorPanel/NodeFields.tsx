import { useId } from "react";
import type { NodeData } from "../../types";
import { Input } from "../ui/input";

interface NodeFieldsProps {
	label: string;
	content: string;
	onChange: (field: keyof NodeData, value: string) => void;
}

export function NodeFields({
	label,
	content,
	onChange,
}: Readonly<NodeFieldsProps>) {
	const labelId = useId();
	const contentId = useId();

	return (
		<>
			<div className="space-y-2">
				<label htmlFor={labelId} className="text-sm font-medium leading-none">
					Node Title
				</label>
				<Input
					id={labelId}
					value={label}
					onChange={(e) => onChange("label", e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor={contentId} className="text-sm font-medium leading-none">
					Bot Message
				</label>
				<textarea
					id={contentId}
					className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-smooth"
					value={content}
					onChange={(e) => onChange("content", e.target.value)}
				/>
			</div>
		</>
	);
}
