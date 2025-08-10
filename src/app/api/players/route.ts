import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(players);
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

    const { name, pId, description, url, coverUrl, announcement } = await request.json();

    if (!name || !pId || !url) {
      return NextResponse.json(
        { error: '名称、ID 和 URL 不能为空' },
        { status: 400 }
      );
    }

    const existingPlayer = await prisma.player.findUnique({
      where: { pId }
    });

    if (existingPlayer) {
      return NextResponse.json(
        { error: '播放器 ID 已存在' },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({
      data: {
        name,
        pId,
        description: description || null,
        url,
        coverUrl: coverUrl || null,
        announcement: announcement || null
      }
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: '创建播放器失败' },
      { status: 500 }
    );
  }
}