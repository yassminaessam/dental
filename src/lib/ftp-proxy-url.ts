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

// Client-side version (works in browser)
export function getClientFtpProxyUrl(imageUrl: string): string {
  // Check if in development (client-side check)
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.endsWith('.local'));
  
  console.log('🔍 Development Mode?', isDevelopment, 'Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
  
  if (!isDevelopment) {
    console.log('⚠️ Not in development mode, returning original URL');
    return imageUrl;
  }

  // Check if URL is from FTP server
  if (imageUrl.startsWith('https://dental.adsolutions-eg.com/assets/')) {
    const path = imageUrl.replace('https://dental.adsolutions-eg.com/assets/', '');
    const proxyUrl = `/api/ftp-proxy?path=${encodeURIComponent(path)}`;
    console.log('✅ Converting to proxy URL:', proxyUrl);
    return proxyUrl;
  }

  console.log('⚠️ URL not from FTP server, returning as-is');
  return imageUrl;
}
