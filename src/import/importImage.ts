import { IMAGE_IMPORT_GRID_SIZE } from "../models/grid";
import type { ProjectDocument } from "../samples/schema";
import { yieldToMain } from "../shared/yieldToMain";
import { buildImageProjectDocument } from "./buildImageProject";
import {
  DEFAULT_IMAGE_IMPORT_OPTIONS,
  type ImageImportOptions,
  rasterizeImageToCells,
} from "./imageToGrid";
import { loadImageFromFile } from "./loadImageFile";

export type ImportImageResult =
  | { ok: true; doc: ProjectDocument }
  | { ok: false; error: string };

/**
 * NOTE: Full pipeline from File to a replace-canvas ProjectDocument.
 */
export async function importImageFile(
  file: File,
  gridSize: number = IMAGE_IMPORT_GRID_SIZE,
  options: ImageImportOptions = DEFAULT_IMAGE_IMPORT_OPTIONS,
): Promise<ImportImageResult> {
  try {
    const img = await loadImageFromFile(file);
    await yieldToMain();
    const cells = rasterizeImageToCells(img, img.naturalWidth, img.naturalHeight, gridSize, options);
    await yieldToMain();
    const doc = buildImageProjectDocument(cells, gridSize);
    return { ok: true, doc };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to import image.";
    return { ok: false, error: message };
  }
}
