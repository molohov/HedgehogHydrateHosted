import sharp from "sharp";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type ProcessedImage = {
  data: Buffer;
  mime: string;
};

export async function processUploadedImage(
  file: File,
  maxDimension: number,
): Promise<ProcessedImage> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be 2 MB or smaller.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const data = await sharp(input)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  return {
    data: Buffer.from(data),
    mime: "image/webp",
  };
}
