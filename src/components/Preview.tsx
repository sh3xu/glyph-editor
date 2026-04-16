import { useEffect, useRef, useState } from "react";
import { pathToSvgD } from "../smoothing/bezier";
import type { SmoothedLayerResult } from "../smoothing/slider";

interface PreviewProps {
  smoothedResult: SmoothedLayerResult[];
  gridSize: number;
}

export function Preview({ smoothedResult, gridSize }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxSize, setMaxSize] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]!.contentRect;
      setMaxSize(Math.floor(Math.min(width, height)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const viewSize = gridSize + 2; // padded coordinate space
  const svgPixels = maxSize > 0 ? maxSize : 400;
  const center = viewSize / 2;

  const hasPaths = smoothedResult.some((l) => l.paths.length > 0);

  return (
    <div ref={containerRef} className="preview-container">
      <div className="preview-frame" style={{ width: svgPixels, height: svgPixels }}>
        {hasPaths ? (
          <svg viewBox={`0 0 ${viewSize} ${viewSize}`} width={svgPixels} height={svgPixels}>
            {smoothedResult.map((layer) => {
              const rot = layer.rotation ?? 0;
              const transform = rot !== 0 ? `rotate(${rot}, ${center}, ${center})` : undefined;
              // Group paths by color, combine into single <path> with evenodd
              // so holes (counter-clockwise contours) subtract from fills
              const byColor = new Map<string, string[]>();
              for (const path of layer.paths) {
                const d = pathToSvgD(path);
                if (!d) continue;
                const arr = byColor.get(path.color);
                if (arr) arr.push(d);
                else byColor.set(path.color, [d]);
              }

              return (
                <g key={layer.layerId} transform={transform}>
                  {[...byColor.entries()].map(([color, ds]) => (
                    <path key={color} d={ds.join(" ")} fill={color} fillRule="evenodd" />
                  ))}
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="preview-empty" style={{ width: svgPixels, height: svgPixels }}>
            Draw to see preview
          </div>
        )}
      </div>
    </div>
  );
}
