/**
 * Identifier helpers. Trace IDs are 16 random bytes (32 hex chars) and span IDs
 * are 8 random bytes (16 hex chars), matching the sizing the backend expects.
 * Uses the Web Crypto API, available in Node 18+ and browsers.
 */

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateTraceId(): string {
  return randomHex(16);
}

export function generateSpanId(): string {
  return randomHex(8);
}
