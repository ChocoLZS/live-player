import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import PlayerComponent from '@/components/Player';

interface PlayerPageProps {
  params: { id: string };
}

async function getPlayer(pId: string) {
  try {
    const player = await prisma.player.findUnique({
      where: { pId }
    });
    return player;
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const player = await getPlayer(params.id);
  
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
  const player = await getPlayer(params.id);

  if (!player) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <PlayerComponent player={player} />
    </div>
  );
}