# SupportFlow Visual Builder

Visual decision-tree editor for SupportFlow AI. It replaces spreadsheet-driven chatbot configuration with a graph editor plus an instant chat runner.

## Stack
- React + TypeScript
- Zustand (state)
- SVG (custom connector rendering)
- Tailwind utility classes + custom design tokens

## Run
```bash
pnpm install
pnpm dev
```

## Quality checks
```bash
pnpm exec tsc --noEmit
pnpm check
pnpm test
```

Note: in this environment, `pnpm test` can fail with `spawn EPERM` (esbuild process restriction), not app type errors.

## Assignment compliance

### Phase 1: Design System
- Design tokens and visual language are documented in `docs/DESIGN_SYSTEM.md`.
- Token source is `src/styles.css`.
- Includes required categories:
  - Canvas
  - Node Cards
  - Connectors
  - Color Semantics

### Phase 2: Implementation constraints
- No flowchart/graph library is used (`react-flow`, `jsPlumb`, `mermaid` are not used).
- Node layout and connector geometry are implemented manually with DOM coordinates + SVG paths.
- No Material UI / Bootstrap component library usage.

## User stories and acceptance criteria mapping

### Story 1: Visual Graph
- AC1: Nodes render from JSON data source (`src/flow_data.json`) via store bootstrapping in `src/stores/flowStore.ts`.
- AC2: Nodes use absolute positioning from `position.x/y` in `src/components/Canvas/DraggableNode.tsx`.
- AC3: Parent-child lines are rendered in SVG using custom bezier logic in:
  - `src/components/Canvas/ConnectionLayer.tsx`
  - `src/components/Canvas/ConnectionPath.tsx`
  - `src/components/Canvas/connectionLayerUtils.ts`

### Story 2: Editor
- AC1: Selecting/double-clicking a node opens inspector panel (`src/components/EditorPanel.tsx`).
- AC2: Editing title/content/options updates live canvas state through Zustand actions (`updateNode`).
- AC3: State is intentionally local/in-memory (`src/stores/flowStore.ts`), no backend dependency.

### Story 3: Preview Mode
- AC1: Run button toggles editor to preview (`setMode("preview")`) in `src/components/Canvas/FlowCanvas.tsx`.
- AC2: Preview starts from inferred root node (first node with no incoming edge) in `src/components/Preview/chatPreviewUtils.ts`.
- AC3: Selecting an option traverses graph using connection matching (`sourceId + sourceHandle`) in `src/components/Preview/ChatPreview.tsx`.
- AC4: End-of-flow state shows restart CTA (`Restart Conversation`) in `src/components/Preview/ChatPreview.tsx`.

## Wildcard feature (required)

### Chosen feature: In-canvas connector management (selection + deletion)
Why this matters for business:
- Non-technical managers can quickly correct routing mistakes directly on the graph.
- Reduces configuration time during policy changes and incident updates.
- Prevents hidden spreadsheet-like edge errors by making routes explicit and editable.

Implementation:
- Click connector to select.
- Delete via keyboard (`Delete` / `Backspace`) or inline delete control on highlighted edge.
- Single-selection model across nodes/connectors for predictable editing.

Files:
- `src/components/Canvas/ConnectionLayer.tsx`
- `src/components/Canvas/ConnectionPath.tsx`
- `src/stores/flowStore.ts`
- `src/types.ts`

## Additional useful features implemented
- Drag-and-drop node creation from palette.
- Zoom + pan canvas controls.
- JSON import/export for flow portability.
- Conversation preview with typing simulation.

## Project docs
- Architecture and behavior: `docs/IMPLEMENTATION.md`
- Component decomposition map: `docs/COMPONENT_MAP.md`
- Design system tokens and semantics: `docs/DESIGN_SYSTEM.md`
