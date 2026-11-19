/**
 * image.ts — image intake for chat: magic-byte check and data URL encoding.
 *
 * Magic-byte matching approach copied and adapted from
 * the studio component library (file-upload magic-byte check)
 * (matchBytes + fixed signatures). Adapted: detect the real type from the
 * bytes instead of validating a declared MIME, allow only PNG/JPEG/WebP,
 * and add a 3 MB size cap. WebP signature (RIFF....WEBP) added here.
 */

// 3 MB raw keeps the base64 JSON body near 4 MB, under Vercel's 4.5 MB cap.
const MAX_BYTES = 3 * 1024 * 1024;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff] as const;
const RIFF_MARKER = [0x52, 0x49, 0x46, 0x46] as const; // RIFF at offset 0
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50] as const; // WEBP at offset 8

const SIZE_MESSAGE = "That image is too big. Please keep it under 3 MB.";
const TYPE_MESSAGE = "Only PNG, JPEG and WebP images are allowed.";
const MISMATCH_MESSAGE =
  "This file is not the image type it says it is. Please upload a PNG, JPEG or WebP image.";

/** Compare bytes[offset..offset+signature.length] against signature. */
function matchBytes(
  bytes: Uint8Array,
  offset: number,
  signature: readonly number[],
): boolean {
  if (bytes.length < offset + signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (bytes[offset + i] !== signature[i]) return false;
  }
  return true;
}

/** Detect the real image type from the bytes, or null when unsupported. */
function sniffMime(bytes: Uint8Array): string | null {
  if (matchBytes(bytes, 0, PNG_SIGNATURE)) return "image/png";
  if (matchBytes(bytes, 0, JPEG_SIGNATURE)) return "image/jpeg";
  if (matchBytes(bytes, 0, RIFF_MARKER) && matchBytes(bytes, 8, WEBP_MARKER)) {
    return "image/webp";
  }
  return null;
}

export type CheckImageResult =
  | { ok: true; mime: string }
  | { ok: false; message: string };

/**
 * Accept only PNG, JPEG and WebP, verified by magic bytes — never by the
 * declared type or file name. Refuse anything over 3 MB.
 */
export function checkImage(
  bytes: Uint8Array,
  declaredMime: string,
): CheckImageResult {
  if (bytes.length > MAX_BYTES) {
    return { ok: false, message: SIZE_MESSAGE };
  }
  const mime = sniffMime(bytes);
  if (!mime) {
    return { ok: false, message: TYPE_MESSAGE };
  }
  if (declaredMime && declaredMime !== mime) {
    return { ok: false, message: MISMATCH_MESSAGE };
  }
  return { ok: true, mime };
}

/** Encode bytes as a base64 data URL. Works in Node and the browser. */
export function toDataUrl(bytes: Uint8Array, mime: string): string {
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:${mime};base64,${btoa(binary)}`;
}