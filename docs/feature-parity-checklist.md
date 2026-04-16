# Feature Parity Checklist

This checklist is the migration contract for the new architecture and UI.

## Editor behavior

- Draw, erase, line, rectangle, ellipse, and fill tools behave exactly as before.
- Brush size options remain `1-4`.
- Symmetry modes remain `none`, `horizontal`, `vertical`, `both`.
- Shape mode still supports `outline` and `filled`.
- Hover and ghost preview behavior remains visible during drawing.

## Canvas interaction

- Zoom range remains `0.5x` to `4x`.
- Mouse wheel zoom works the same way.
- Hold `Space` to pan.
- Double click resets pan/zoom.
- Cursor position reporting remains available for status bar.

## Layer behavior

- Minimum 2 layers available at startup.
- Maximum 3 layers can exist.
- Active layer selection remains unchanged.
- Visibility toggles continue to affect draw/preview/export.
- Rotation controls keep preset buttons and numeric input behavior.

## History behavior

- Undo/redo keyboard shortcuts still work:
  - Undo: `Ctrl+Z` / `Cmd+Z`
  - Redo: `Ctrl+Y` and `Ctrl+Shift+Z` / `Cmd+Shift+Z`
- Stroke operations are still committed as a single undoable command.
- Grid resize remains undoable and redoable.

## Preview and smoothing

- Preview renders smoothed output for all visible layers.
- Smoothing modes remain `squircle` and `smooth`.
- Alpha slider remains in range `0-1` with step behavior unchanged.

## Export behavior

- Export modes remain `light`, `dark`, `adaptive`.
- SVG export continues to generate downloadable file output.
- PNG export continues to support `1x`, `2x`, `4x`.
- Filename behavior remains consistent with mode and format.
