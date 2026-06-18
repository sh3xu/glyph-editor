export const MAX_IMAGE_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 4096;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) {
    return "";
  }
  return name.slice(dot).toLowerCase();
}

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return `Image file is too large (max ${MAX_IMAGE_FILE_BYTES / (1024 * 1024)} MB).`;
  }

  const ext = fileExtension(file.name);
  const mimeOk = file.type.length > 0 && ALLOWED_MIME_TYPES.has(file.type);
  const extOk = ext.length > 0 && ALLOWED_EXTENSIONS.has(ext);

  if (!mimeOk && !extOk) {
    return "Unsupported image type. Use PNG, JPEG, WebP, or GIF.";
  }

  return null;
}

function loadImageElement(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image file."));
    img.src = objectUrl;
  });
}

/**
 * NOTE: Decodes a user-selected image file in the browser.
 */
export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const validationError = validateImageFile(file);
  if (validationError !== null) {
    throw new Error(validationError);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(objectUrl);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (w <= 0 || h <= 0) {
      throw new Error("Image has invalid dimensions.");
    }
    if (w > MAX_IMAGE_DIMENSION || h > MAX_IMAGE_DIMENSION) {
      throw new Error(
        `Image dimensions must be at most ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}.`,
      );
    }
    return img;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
