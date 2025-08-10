import { notFound } from 'next/navigation';
import { getDb, players } from '@/lib/db';
import PlayerComponent from '@/components/Player';
import { eq } from 'drizzle-orm';

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

async function getPlayer(pId: string) {
  try {
    const db = getDb();
    const [player] = await db.select().from(players).where(eq(players.pId, pId)).limit(1);
    return player || null;
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const resolvedParams = await params;
  const player = await getPlayer(resolvedParams.id);
  
  if (!player) {
    return {
      title: '播放器未找到',
    };
  }

  return {
    title: `${player.name} - 在线播放平台`,
    description: player.description || `观看 ${player.name}`,
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const resolvedParams = await params;
  const player = await getPlayer(resolvedParams.id);

  if (!player) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <PlayerComponent player={player} />
    </div>
  );
}