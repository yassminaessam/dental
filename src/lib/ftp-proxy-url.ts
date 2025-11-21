/**
 * FTP URL handler - Direct URLs work without proxy
 * Freehostia serves files via HTTP/HTTPS directly
 */

// Server-side version
export function getFtpProxyUrl(imageUrl: string): string {
  // Direct URLs work - no proxy needed
  return imageUrl;
}

// Client-side version
export function getClientFtpProxyUrl(imageUrl: string): string {
  // Direct URLs work - no proxy needed
  return imageUrl;
}
