import type { NodeOption } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ChoiceOptionsEditorProps {
	options: NodeOption[];
	onAddOption: () => void;
	onUpdateOption: (optionId: string, label: string) => void;
	onDeleteOption: (optionId: string) => void;
}

export function ChoiceOptionsEditor({
	options,
	onAddOption,
	onUpdateOption,
	onDeleteOption,
}: Readonly<ChoiceOptionsEditorProps>) {
	return (
		<div className="space-y-3 pt-4 border-t border-border">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Branches</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={onAddOption}
					className="h-6 text-xs text-primary"
				>
					+ Add
				</Button>
			</div>
			<div className="space-y-2">
				{options.map((opt) => (
					<div key={opt.id} className="flex gap-2">
						<Input
							value={opt.label}
							onChange={(e) => onUpdateOption(opt.id, e.target.value)}
							className="h-8"
						/>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 text-text-muted hover:text-destructive"
							onClick={() => onDeleteOption(opt.id)}
						>
							x
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
