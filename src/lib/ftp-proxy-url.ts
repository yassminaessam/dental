/**
 * Converts FTP public URLs to use local proxy in development
 * This allows viewing images from FTP server during local development
 * when the FTP public URL is not accessible
 */
export function getFtpProxyUrl(imageUrl: string): string {
  // In production, use the original URL
  if (process.env.NODE_ENV === 'production') {
    return imageUrl;
  }

  // Check if URL is from FTP server
  const ftpPublicUrl = process.env.NEXT_PUBLIC_FTP_PUBLIC_URL || 'https://dental.adsolutions-eg.com/assets';
  
  if (imageUrl.startsWith(ftpPublicUrl)) {
    // Extract the path after /assets/
    const path = imageUrl.replace(ftpPublicUrl + '/', '');
    // Use our FTP proxy API
    return `/api/ftp-proxy?path=${encodeURIComponent(path)}`;
  }

  // If it's a local path or other URL, return as-is
  return imageUrl;
}

// Client-side version (works in browser - both dev and production)
export function getClientFtpProxyUrl(imageUrl: string): string {
  // ALWAYS use FTP proxy for dental.adsolutions-eg.com URLs
  // because the web server doesn't serve files from that location
  
  // Check if URL is from FTP server
  if (imageUrl.startsWith('https://dental.adsolutions-eg.com/assets/')) {
    const path = imageUrl.replace('https://dental.adsolutions-eg.com/assets/', '');
    const proxyUrl = `/api/ftp-proxy?path=${encodeURIComponent(path)}`;
    
    if (typeof window !== 'undefined') {
      console.log('🔄 Using FTP Proxy for:', imageUrl);
      console.log('   Proxy URL:', proxyUrl);
    }
    
    return proxyUrl;
  }

  // For local paths or other URLs, return as-is
  return imageUrl;
}
