/**
 * Convert binary image data to base64 data URL
 * @param imageData - Binary image data (ArrayBuffer or number array)
 * @returns Base64 data URL string or null if no data
 */
export function binaryToBase64Image(imageData: ArrayBuffer | number[] | null | undefined): string | null {
  if (!imageData) return null;

  try {
    // Handle both ArrayBuffer (from SSR) and Array (from API)
    const uint8Array = Array.isArray(imageData) 
      ? new Uint8Array(imageData)
      : new Uint8Array(imageData as ArrayBuffer);
    
    // Convert to base64 in chunks to avoid call stack overflow
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting binary to base64:', error);
    return null;
  }
}

/**
 * Get cover image source with fallback to coverUrl
 * @param coverImage - Binary image data
 * @param coverUrl - Fallback URL
 * @returns Image source URL or null
 */
export function getCoverImageSrc(
  coverImage: ArrayBuffer | number[] | null | undefined, 
  coverUrl: string | null | undefined
): string | null {
  const base64Image = binaryToBase64Image(coverImage);
  return base64Image || coverUrl || null;
}