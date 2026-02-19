import type { HandleDef } from "./nodeTypes";

export const TARGET_HANDLES: HandleDef[] = [
	{
		type: "target",
		position: "top",
		className: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
	},
	{
		type: "target",
		position: "left",
		className: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
	},
];

export const MESSAGE_SOURCE_HANDLES: HandleDef[] = [
	{
		type: "source",
		position: "right",
		className: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
	},
	{
		type: "source",
		position: "bottom",
		className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
	},
];
