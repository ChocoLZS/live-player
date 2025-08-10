import { NextRequest, NextResponse } from 'next/server';
import { getDb, players } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    const playerList = await db.select().from(players).orderBy(desc(players.updatedAt));
    return NextResponse.json(playerList);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: '获取播放器列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    const { name, pId, description, url, coverUrl, announcement } = await request.json() as any;

    if (!name || !pId || !url) {
      return NextResponse.json(
        { error: '名称、ID 和 URL 不能为空' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Check if player with pId already exists
    const existingPlayer = await db.select().from(players).where(eq(players.pId, pId)).limit(1);

    if (existingPlayer.length > 0) {
      return NextResponse.json(
        { error: '播放器 ID 已存在' },
        { status: 400 }
      );
    }

    const [player] = await db.insert(players).values({
      name,
      pId,
      description: description || null,
      url,
      coverUrl: coverUrl || null,
      announcement: announcement || null,
      updatedAt: new Date().toISOString()
    }).returning();

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: '创建播放器失败' },
      { status: 500 }
    );
  }
}