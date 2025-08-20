import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface R2Binding {
  put(key: string, value: ArrayBuffer | Uint8Array | ReadableStream, options?: {
    httpMetadata?: {
      contentType?: string;
      cacheControl?: string;
    };
  }): Promise<void>;
  get(key: string): Promise<{
    body: ReadableStream;
    httpMetadata?: {
      contentType?: string;
    };
  } | null>;
  delete(key: string): Promise<void>;
}

/**
 * Get R2 storage binding
 */
export function getR2() {
  const { env } = getCloudflareContext();
  return env.IMAGES;
}

/**
 * Generate unique key for player cover image
 */
export function generateCoverImageKey(playerId: string): string {
  const timestamp = Date.now();
  return `covers/${playerId}-${timestamp}.jpg`;
}

/**
 * Upload image to R2 storage
 */
export async function uploadImageToR2(
  key: string,
  imageData: ArrayBuffer | Uint8Array,
  contentType: string = 'image/jpeg'
): Promise<void> {
  const r2 = getR2();
  await r2.put(key, imageData, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000', // 1 year cache
    },
  });
}

/**
 * Delete image from R2 storage
 */
export async function deleteImageFromR2(key: string): Promise<void> {
  const r2 = getR2();
  await r2.delete(key);
}

/**
 * Get public URL for R2 object through Worker API
 */
export function getR2PublicUrl(key: string): string {
  // Use internal API route to serve images from R2
  return `/api/images/${key}`;
}

/**
 * Get direct R2 URL (if using custom domain)
 */
export function getR2DirectUrl(key: string): string {
  // Replace with your R2 custom domain
  // Example: https://images.yourdomain.com/key
  return `https://pub-your-bucket-id.r2.dev/${key}`;
}