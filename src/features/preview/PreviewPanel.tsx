import { Preview } from "../../components/Preview";
import type { SmoothedLayerResult } from "../../smoothing/slider";

interface PreviewPanelProps {
  smoothedResult: SmoothedLayerResult[];
  gridSize: number;
}

export function PreviewPanel({ smoothedResult, gridSize }: PreviewPanelProps) {
  return (
    <section className="preview-layout">
      <div className="section-header">Preview</div>
      <Preview smoothedResult={smoothedResult} gridSize={gridSize} />
    </section>
  );
}
