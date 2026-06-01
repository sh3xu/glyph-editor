import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import type { ImageFit } from "../../import/fitRects";
import { importImageFile } from "../../import/importImage";
import {
  DEFAULT_IMAGE_IMPORT_OPTIONS,
  type ImageImportOptions,
} from "../../import/imageToGrid";
import { IMAGE_IMPORT_GRID_SIZE } from "../../models/grid";
import { parseProjectImportText } from "../../samples/projectImport";
import type { ProjectDocument } from "../../samples/schema";
import { ConfirmDialog } from "./ConfirmDialog";

interface WorkspaceImportProps {
  canvasHasContent: boolean;
  theme: "dark" | "light";
  onApplyImportedProject: (doc: ProjectDocument) => void;
}

export function WorkspaceImport({
  canvasHasContent,
  theme,
  onApplyImportedProject,
}: WorkspaceImportProps) {
  const [open, setOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingDoc, setPendingDoc] = useState<ProjectDocument | null>(null);
  const [imageFit, setImageFit] = useState<ImageFit>(DEFAULT_IMAGE_IMPORT_OPTIONS.fit);
  const [imageAlphaThreshold, setImageAlphaThreshold] = useState(
    DEFAULT_IMAGE_IMPORT_OPTIONS.alphaThreshold,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || importConfirmOpen) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      const el = rootRef.current;
      if (el && !el.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, importConfirmOpen]);

  function applyOrConfirmProject(doc: ProjectDocument) {
    if (canvasHasContent) {
      setPendingDoc(doc);
      setImportConfirmOpen(true);
      setOpen(false);
      return;
    }
    onApplyImportedProject(doc);
    setOpen(false);
  }

  function pickProjectFile() {
    setImportMessage(null);
    projectFileInputRef.current?.click();
  }

  function pickImageFile() {
    setImportMessage(null);
    imageFileInputRef.current?.click();
  }

  async function handleImportProjectFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImportMessage(null);
    if (!file) {
      return;
    }
    const text = await file.text();
    const result = parseProjectImportText(text);
    if (!result.ok) {
      setImportMessage(result.error);
      return;
    }
    applyOrConfirmProject(result.doc);
  }

  async function handleImportImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImportMessage(null);
    if (!file) {
      return;
    }

    const options: ImageImportOptions = {
      fit: imageFit,
      alphaThreshold: imageAlphaThreshold,
    };
    const result = await importImageFile(file, IMAGE_IMPORT_GRID_SIZE, options);
    if (!result.ok) {
      setImportMessage(result.error);
      return;
    }
    applyOrConfirmProject(result.doc);
  }

  function handleConfirmImportReplace() {
    if (pendingDoc) {
      onApplyImportedProject(pendingDoc);
    }
    setImportConfirmOpen(false);
    setPendingDoc(null);
  }

  function handleCancelImportReplace() {
    setImportConfirmOpen(false);
    setPendingDoc(null);
  }

  return (
    <div className="workspace-samples workspace-import" ref={rootRef}>
      <button
        type="button"
        className="btn btn-sm"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="workspace-import-menu"
        onClick={() => setOpen((current) => !current)}
      >
        Import
      </button>
      {open ? (
        <div
          id="workspace-import-menu"
          className="workspace-samples-panel workspace-import-panel"
          role="menu"
          aria-label="Import artwork"
        >
          <div className="workspace-samples-intro">
            Replace the canvas with a project file or rasterize an image to a{" "}
            {IMAGE_IMPORT_GRID_SIZE}&times;{IMAGE_IMPORT_GRID_SIZE} pixel grid.
          </div>
          <div className="workspace-import-actions">
            <button
              type="button"
              className="btn btn-sm workspace-import-action"
              role="menuitem"
              onClick={pickProjectFile}
            >
              Project (.json)
            </button>
            <button
              type="button"
              className="btn btn-sm workspace-import-action"
              role="menuitem"
              onClick={pickImageFile}
            >
              Image (PNG, JPEG, WebP, GIF)
            </button>
          </div>
          <div className="workspace-import-options">
            <span className="workspace-import-options-label">Image options</span>
            <div className="workspace-import-row">
              <span className="workspace-import-sublabel">Fit</span>
              <SegmentedControl
                size="sm"
                options={[
                  { value: "contain", label: "Contain" },
                  { value: "cover", label: "Cover" },
                ]}
                value={imageFit}
                onChange={(value) => setImageFit(value as ImageFit)}
              />
            </div>
            <div className="workspace-import-row">
              <span className="workspace-import-sublabel">Alpha</span>
              <div className="workspace-import-alpha">
                <input
                  className="slider"
                  type="range"
                  min={0}
                  max={255}
                  step={1}
                  value={imageAlphaThreshold}
                  onChange={(e) => setImageAlphaThreshold(Number(e.target.value))}
                  aria-label="Alpha threshold for image import"
                />
                <span className="slider-value">{imageAlphaThreshold}</span>
              </div>
            </div>
          </div>
          {importMessage ? <div className="workspace-import-error">{importMessage}</div> : null}
        </div>
      ) : null}
      <input
        ref={projectFileInputRef}
        type="file"
        className="inspector-file-input-hidden"
        accept=".json,application/json"
        aria-label="Import project JSON file"
        onChange={handleImportProjectFileChange}
      />
      <input
        ref={imageFileInputRef}
        type="file"
        className="inspector-file-input-hidden"
        accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
        aria-label="Import image file"
        onChange={handleImportImageFileChange}
      />
      <ConfirmDialog
        open={importConfirmOpen}
        theme={theme}
        title="Replace canvas?"
        message="Importing will replace your current artwork and clear undo history for this session."
        confirmLabel="Replace canvas"
        cancelLabel="Cancel"
        onConfirm={handleConfirmImportReplace}
        onCancel={handleCancelImportReplace}
      />
    </div>
  );
}
