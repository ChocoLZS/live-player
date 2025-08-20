import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadImageToR2, generateCoverImageKey, getR2PublicUrl } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const playerId = formData.get('playerId') as string;

    if (!file || !playerId) {
      return NextResponse.json(
        { error: 'File and playerId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique key and upload to R2
    const key = generateCoverImageKey(playerId);
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('Uploading to R2:', { 
      key, 
      fileSize: arrayBuffer.byteLength, 
      contentType: file.type 
    });
    
    await uploadImageToR2(key, new Uint8Array(arrayBuffer), file.type);
    
    console.log('Upload completed for key:', key);
    
    const publicUrl = getR2PublicUrl(key);

    return NextResponse.json({
      key,
      url: publicUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}