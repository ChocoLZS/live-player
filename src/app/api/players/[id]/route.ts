import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    const { name, pId, description, url, coverUrl, announcement } = await request.json();
    const playerId = parseInt(params.id);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: '无效的播放器 ID' },
        { status: 400 }
      );
    }

    if (!name || !pId || !url) {
      return NextResponse.json(
        { error: '名称、ID 和 URL 不能为空' },
        { status: 400 }
      );
    }

    const existingPlayer = await prisma.player.findFirst({
      where: {
        pId,
        NOT: { id: playerId }
      }
    });

    if (existingPlayer) {
      return NextResponse.json(
        { error: '播放器 ID 已存在' },
        { status: 400 }
      );
    }

    const player = await prisma.player.update({
      where: { id: playerId },
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
    console.error('Error updating player:', error);
    return NextResponse.json(
      { error: '更新播放器失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      );
    }

    const playerId = parseInt(params.id);

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: '无效的播放器 ID' },
        { status: 400 }
      );
    }

    await prisma.player.delete({
      where: { id: playerId }
    });

    return NextResponse.json({ message: '播放器删除成功' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { error: '删除播放器失败' },
      { status: 500 }
    );
  }
}