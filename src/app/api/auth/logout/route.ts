import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    
    return NextResponse.json({ message: '已退出登录' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '退出登录失败' },
      { status: 500 }
    );
  }
}