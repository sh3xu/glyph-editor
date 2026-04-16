interface WorkspaceHeaderProps {
  theme: "dark" | "light";
  gridSizeInput: string;
  gridMin: number;
  gridMax: number;
  canUndo: boolean;
  canRedo: boolean;
  onThemeToggle: () => void;
  onGridSizeInputChange: (value: string) => void;
  onGridSizeSubmit: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function WorkspaceHeader({
  theme,
  gridSizeInput,
  gridMin,
  gridMax,
  canUndo,
  canRedo,
  onThemeToggle,
  onGridSizeInputChange,
  onGridSizeSubmit,
  onUndo,
  onRedo,
}: WorkspaceHeaderProps) {
  return (
    <header className="workspace-header">
      <div className="workspace-brand">
        <h1>MakeLogo Studio</h1>
        <p>Vector-first logo design workspace</p>
      </div>
      <div className="workspace-actions">
        <button className="btn" onClick={onThemeToggle}>
          Theme: {theme}
        </button>
        <label className="field">
          Grid
          <input
            className="input input-sm"
            value={gridSizeInput}
            onChange={(event) => onGridSizeInputChange(event.target.value)}
            onBlur={onGridSizeSubmit}
            onKeyDown={(event) => event.key === "Enter" && onGridSizeSubmit()}
            aria-label={`Grid size (${gridMin}-${gridMax})`}
          />
        </label>
        <button className="btn" disabled={!canUndo} onClick={onUndo}>
          Undo
        </button>
        <button className="btn" disabled={!canRedo} onClick={onRedo}>
          Redo
        </button>
      </div>
    </header>
  );
}
