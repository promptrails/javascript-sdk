/**
 * Identifier helpers. Trace IDs are 16 random bytes (32 hex chars) and span IDs
 * are 8 random bytes (16 hex chars), matching the sizing the backend expects.
 */

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  const webCrypto = (globalThis as { crypto?: Crypto }).crypto;
  if (webCrypto?.getRandomValues) {
    // Browsers and Node 19+ (Web Crypto is a global).
    webCrypto.getRandomValues(buf);
  } else {
    // Node 18 has no global Web Crypto. Trace/span IDs are identifiers, not
    // secrets, so a non-cryptographic fallback is acceptable here.
    for (let i = 0; i < bytes; i++) buf[i] = (Math.random() * 256) | 0;
  }
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateTraceId(): string {
  return randomHex(16);
}

export function generateSpanId(): string {
  return randomHex(8);
}
