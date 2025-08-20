import { NextRequest, NextResponse } from 'next/server';
import { getDb, Player, players } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { getR2PublicUrl } from '@/lib/r2';

export async function GET() {
  try {
    const playerList = await cache.getOrFetch(
      CACHE_KEYS.PLAYER_LIST,
      async () => {
        const db = getDb();
        return await db.select().from(players).orderBy(desc(players.updatedAt));
      },
      CACHE_TTL.PLAYER_LIST
    );
    
    // Add coverImageUrl for frontend use
    const playersWithImageUrls = playerList.map(player => ({
      ...player,
      // Use R2 URL if available, fallback to coverUrl
      coverImageUrl: player.coverImageR2Key 
        ? getR2PublicUrl(player.coverImageR2Key)
        : player.coverUrl
    }));
    
    return NextResponse.json(playersWithImageUrls);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const new_player = await request.json() as Player;
    const { name, pId, description, url, coverUrl, announcement, coverImageR2Key } = new_player;

    if (!name || !pId || !url) {
      return NextResponse.json(
        { error: 'Name, ID and URL are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Check if player with pId already exists
    const existingPlayer = await db.select().from(players).where(eq(players.pId, pId)).limit(1);

    if (existingPlayer.length > 0) {
      return NextResponse.json(
        { error: 'Player ID already exists' },
        { status: 400 }
      );
    }

    const [player] = await db.insert(players).values({
      ...new_player,
      updatedAt: new Date().toISOString(),
    }).returning();

    // Add coverImageUrl for frontend use
    const playerWithImageUrl = {
      ...player,
      // Use R2 URL if available, fallback to coverUrl
      coverImageUrl: player.coverImageR2Key 
        ? getR2PublicUrl(player.coverImageR2Key)
        : player.coverUrl
    };

    return NextResponse.json(playerWithImageUrl);
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}