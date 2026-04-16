# Logo gen

A browser-based logo creator that lets you sketch on a grid and export polished SVG or PNG files—no design software needed. Draw using a flexible grid, adjust curve smoothing, and generate clean vector artwork in light, dark, or adaptive themes.

---

## Overview

The editor works through a simple three-step flow:

1. **Create** — fill cells on a grid (from 8×8 up to 128×128). Each cell represents either color or empty space.
2. **Refine** — the system converts filled regions into outlines using marching squares, then smooths them with cubic Bézier curves. A single control adjusts how rounded or sharp the result becomes.
3. **Export** — output the final artwork as SVG or PNG at multiple resolutions.

Everything runs locally in your browser—no backend required.

---

## Capabilities

### Drawing tools

| Tool      | Key | Purpose                    |
| --------- | --- | -------------------------- |
| Draw      | `D` | Paint cells directly       |
| Erase     | `E` | Remove filled cells        |
| Line      | `L` | Draw straight segments     |
| Rectangle | `R` | Create rectangles          |
| Ellipse   | `O` | Create ellipses            |
| Fill      | `F` | Flood-fill connected areas |

**Brush sizes** range from 1 to 4 cells, helping speed up larger edits.

**Symmetry options** include horizontal, vertical, and four-way mirroring—useful for balanced designs.

**Shape modes** allow both filled and outline-only variants for rectangles and ellipses.

---

### Layer system

Supports up to three separate layers. Each layer can be toggled, rotated, and exported independently. In SVG output, layers appear as grouped elements, making further editing easier.

---

### Curve smoothing

A single slider (0 → 1) controls how much smoothing is applied:

* **0** → sharp, grid-based shapes
* **1** → fully smoothed, rounded forms

Two rendering styles:

* **Smooth** — Bézier-based curves
* **Pixel** — hard-edged polygons for a blocky look

Changes update live with a slight debounce for performance.

---

### Export options

**SVG**

* Fully standalone
* Inline styling
* Organized by layer (`<g>`) and color (`<path>`)

**PNG**

* Generated from SVG
* Available at 1×, 2×, and 4× scales

**Themes**

* **Light** — dark elements on light background
* **Dark** — light elements on dark background
* **Adaptive** — automatically switches using `prefers-color-scheme`

---

### Undo / Redo

* Supports full action-level history
* `Ctrl+Z` → undo
* `Ctrl+Shift+Z` → redo
* Each action (draw, drag, resize, etc.) is treated as a single step

---

## Setup

```bash
pnpm install
pnpm dev
```

Open: `http://localhost:5173`

Additional commands:

```bash
pnpm build    # create production build
pnpm preview  # preview build locally
pnpm test     # run tests
pnpm check    # run biome checks
```

No configuration or environment variables needed.

---

## Code layout

```
src/
├── app/             # App setup and orchestration
├── features/        # Core feature modules (editor, preview, inspector)
├── shared/          # Reusable UI elements
├── models/          # Data models (grid, layers, tools)
├── canvas/          # Drawing logic and history handling
├── smoothing/       # Contour detection and curve generation
├── export/          # File generation (SVG/PNG)
└── components/      # Older UI components
```

Processing flow:

```
Grid State → Vector Processing → File Export
```

Each stage is independent and does not modify the previous one.

---

## Stack

* React 19
* Vite 8
* TypeScript
* Vitest + Testing Library

Minimal dependencies beyond React.

---

## Design details

**Contour extraction** uses marching squares with 8-direction connectivity. Ambiguous cases are handled using averaged corner values for smoother, more consistent results.

**Edge handling** adds a virtual padding layer around the grid before processing. This ensures shapes touching edges generate closed paths instead of clipped ones.

**History system** groups changes into complete user actions. For example, a drag operation is stored as one step rather than many small updates.

**Color modes** are applied during export, allowing the same shape data to render in different themes without altering the original grid.

---

## License

MIT
