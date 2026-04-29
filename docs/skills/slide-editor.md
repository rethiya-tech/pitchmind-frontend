# Skill: Slide Editor

## Overview
The slide editor is the core editing surface. It displays a list of slides
with inline editing, drag-and-drop reorder, and 500ms auto-save.

## Component hierarchy
```
EditorPage
  ├── EditorToolbar        (save indicator, theme badge, export button)
  ├── SlideList            (dnd-kit sortable container)
  │   └── SlideCard[]      (individual editable slide)
  │       ├── SlideTitle   (contenteditable h2)
  │       ├── BulletList   (ul, each bullet contenteditable)
  │       │   └── BulletItem[]
  │       └── SlideActions (delete, duplicate, add-below buttons)
  └── SlideDetailPanel     (speaker notes, layout picker — shown on click)
```

## Drag and drop (dnd-kit)
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Wrap list with DndContext + SortableContext
// Each SlideCard uses useSortable hook
// On DragEndEvent: optimistically reorder editorStore.slides,
//   then call POST /api/v1/conversions/:id/slides/reorder
// On error: revert to previous order
```

## Auto-save implementation
```typescript
// useAutoSave hook:
// 1. Watch editorStore.isDirty
// 2. Debounce 500ms after last change
// 3. PATCH /api/v1/slides/:slideId with changed fields only
// 4. On success: set isDirty=false, show "Saved" for 2s
// 5. On network error: show toast "Changes couldn't be saved — retrying"
//    keep isDirty=true, retry after 5s (max 3 retries)
```

## Inline editing
- Title: `<h2 contentEditable onInput={...} onBlur={...} />`
- Bullets: each `<li contentEditable onInput={...} onKeyDown={handleEnter} />`
- Enter key on bullet: insert new bullet below cursor position
- Backspace on empty bullet: delete that bullet, focus previous
- Never use `<textarea>` for slide content — breaks layout

## Soft delete
- Delete button: calls DELETE /api/v1/slides/:id
- Slide animates out (opacity-0 + height-0 over 200ms), then removed from list
- "Undo" toast appears for 5s — clicking it calls POST /api/v1/slides/:id/restore
  and re-inserts slide at original position

## Keyboard shortcuts
| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+S | Force save now |
| Cmd/Ctrl+Z | Undo (last text change via native browser undo) |
| Cmd/Ctrl+D | Duplicate current slide |
| Delete (slide focused) | Soft-delete slide |
| Escape | Deselect / close detail panel |
