import { NextRequest, NextResponse } from 'next/server';
import { getDb, players } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { uploadImageToR2, generateCoverImageKey, getR2PublicUrl, deleteImageFromR2 } from '@/lib/r2';
import { cache, CACHE_KEYS } from '@/lib/cache';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const params = await context.params;
    const playerId = parseInt(params.id);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Invalid Player ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('cover') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const imageData = new Uint8Array(buffer);

    const db = getDb();
    
    // Get current player to check for existing R2 image
    const [currentPlayer] = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
    
    if (!currentPlayer) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Delete old R2 image if exists
    if (currentPlayer.coverImageR2Key) {
      try {
        await deleteImageFromR2(currentPlayer.coverImageR2Key);
      } catch (error) {
        console.warn('Failed to delete old R2 image:', error);
      }
    }

    // Generate new R2 key and upload
    const r2Key = generateCoverImageKey(currentPlayer.pId);
    await uploadImageToR2(r2Key, imageData, file.type);

    // Update player with R2 key
    const [player] = await db.update(players)
      .set({
        coverImageR2Key: r2Key,
        updatedAt: new Date().toISOString()
      })
      .where(eq(players.id, playerId))
      .returning();

    // Clear cache
    cache.delete(CACHE_KEYS.PLAYER_LIST);
    cache.delete(CACHE_KEYS.PLAYER(currentPlayer.pId));

    const coverImageUrl = getR2PublicUrl(r2Key);

    return NextResponse.json({ 
      message: 'Cover image uploaded successfully',
      fileSize: file.size,
      fileType: file.type,
      coverImageUrl
    });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    return NextResponse.json(
      { error: 'Failed to upload cover image' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const playerId = parseInt(params.id);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Invalid Player ID' },
        { status: 400 }
      );
    }

    const db = getDb();
    const [player] = await db.select({ 
      coverImageR2Key: players.coverImageR2Key,
      coverUrl: players.coverUrl 
    }).from(players).where(eq(players.id, playerId)).limit(1);

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Redirect to R2 image or return URL info
    if (player.coverImageR2Key) {
      const imageUrl = getR2PublicUrl(player.coverImageR2Key);
      return NextResponse.redirect(imageUrl);
    } else if (player.coverUrl) {
      return NextResponse.redirect(player.coverUrl);
    } else {
      return NextResponse.json(
        { error: 'Cover image not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error retrieving cover image:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cover image' },
      { status: 500 }
    );
  }
}