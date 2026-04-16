import type { JSX } from "react";
import { Tool } from "../models/tools";

interface ToolPaletteProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const toolIcons: Record<Tool, { label: string; icon: JSX.Element }> = {
  [Tool.Draw]: {
    label: "Draw",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8.5 2.5l3 3-7.5 7.5H1v-3l7.5-7.5z" />
        <path d="M7 4l3 3" />
      </svg>
    ),
  },
  [Tool.Erase]: {
    label: "Erase",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 13h7M5 10.5L1.5 7a1.5 1.5 0 010-2.12l5-5a1.5 1.5 0 012.12 0L12.5 3.75a1.5 1.5 0 010 2.12L9 9.5" />
        <path d="M5 10.5l4-1" />
      </svg>
    ),
  },
  [Tool.Line]: {
    label: "Line",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      >
        <line x1="2" y1="12" x2="12" y2="2" />
      </svg>
    ),
  },
  [Tool.Rectangle]: {
    label: "Rectangle",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="10" height="10" rx="0.5" />
      </svg>
    ),
  },
  [Tool.Ellipse]: {
    label: "Ellipse",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <ellipse cx="7" cy="7" rx="5" ry="5" />
      </svg>
    ),
  },
  [Tool.Fill]: {
    label: "Fill",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1.5 9.5l5-8 5 8a5 5 0 01-10 0z" />
        <path d="M12 10.5c0 .83.67 1.5 1 2s-.17 1.5-1 1.5-1-.67-1-1.5.67-1.5 1-2z" />
      </svg>
    ),
  },
};

export function ToolPalette({ activeTool, onToolChange }: ToolPaletteProps) {
  return (
    <div className="tool-palette">
      {Object.values(Tool).map((tool) => {
        const { label, icon } = toolIcons[tool];
        const isActive = activeTool === tool;
        return (
          <button
            key={tool}
            className={`tool-btn${isActive ? " tool-btn-active" : ""}`}
            title={label}
            aria-label={label}
            onClick={() => onToolChange(tool)}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
