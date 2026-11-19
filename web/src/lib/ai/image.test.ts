// @vitest-environment node
import { describe, expect, it } from "vitest";
import { checkImage, toDataUrl } from "./image";

const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const JPEG_HEADER = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46];
const WEBP_HEADER = [
  0x52, 0x49, 0x46, 0x46, // RIFF
  0x24, 0x00, 0x00, 0x00, // size
  0x57, 0x45, 0x42, 0x50, // WEBP
];

function withPngHeader(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  bytes.set(PNG_HEADER);
  return bytes;
}

describe("checkImage", () => {
  it("accepts a real PNG header", () => {
    expect(checkImage(new Uint8Array(PNG_HEADER), "image/png")).toEqual({
      ok: true,
      mime: "image/png",
    });
  });

  it("accepts a real JPEG header", () => {
    expect(checkImage(new Uint8Array(JPEG_HEADER), "image/jpeg")).toEqual({
      ok: true,
      mime: "image/jpeg",
    });
  });

  it("accepts a real WebP header", () => {
    expect(checkImage(new Uint8Array(WEBP_HEADER), "image/webp")).toEqual({
      ok: true,
      mime: "image/webp",
    });
  });

  it("refuses a text file even when it is declared as PNG", () => {
    const text = new TextEncoder().encode("just plain text, not an image");
    const result = checkImage(text, "image/png");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message.length).toBeGreaterThan(0);
  });

  it("refuses empty bytes", () => {
    expect(checkImage(new Uint8Array(0), "image/png").ok).toBe(false);
  });

  it("refuses a declared type that does not match the bytes", () => {
    expect(checkImage(new Uint8Array(PNG_HEADER), "image/jpeg").ok).toBe(false);
  });

  it("refuses more than 3 MB even with a valid header", () => {
    const result = checkImage(withPngHeader(3 * 1024 * 1024 + 1), "image/png");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("3 MB");
  });

  it("accepts exactly 3 MB", () => {
    expect(checkImage(withPngHeader(3 * 1024 * 1024), "image/png")).toEqual({
      ok: true,
      mime: "image/png",
    });
  });
});

describe("toDataUrl", () => {
  it("encodes small bytes as a base64 data URL", () => {
    const bytes = new TextEncoder().encode("Hi");
    expect(toDataUrl(bytes, "text/plain")).toBe("data:text/plain;base64,SGk=");
  });

  it("encodes large bytes in chunks without losing data", () => {
    const bytes = new Uint8Array(100_000);
    for (let i = 0; i < bytes.length; i++) bytes[i] = i % 256;
    const expected = `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
    expect(toDataUrl(bytes, "image/png")).toBe(expected);
  });
});