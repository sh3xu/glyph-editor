interface StatusBarProps {
  zoom: number;
  gridSize: number;
  cursorPos: { row: number; col: number } | null;
  activeLayerName: string;
}

export function StatusBar({ zoom, gridSize, cursorPos, activeLayerName }: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <span className="status-item">{Math.round(zoom * 100)}%</span>
        <span className="divider" />
        <span className="status-item">
          {gridSize}&times;{gridSize}
        </span>
      </div>
      <div className="status-bar-right">
        <span className="status-item">
          {cursorPos ? `${cursorPos.row}, ${cursorPos.col}` : "--"}
        </span>
        <span className="divider" />
        <span className="status-item">{activeLayerName}</span>
      </div>
    </div>
  );
}
