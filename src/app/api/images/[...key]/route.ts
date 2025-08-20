import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const { env } = getCloudflareContext();
    
    // Join the key segments to form the full path
    const fullKey = key.join('/');
    
    // Get image from R2
    const object = await env.IMAGES.get(fullKey);
    
    if (!object) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    headers.set('ETag', object.etag || '');

    return new NextResponse(object.body, {
      headers,
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}