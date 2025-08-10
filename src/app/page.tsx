import Link from 'next/link';
import { prisma } from '@/lib/db';

async function getPlayers() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return players;
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

export default async function Home() {
  const players = await getPlayers();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            在线播放平台
          </h1>
          <p className="text-lg text-gray-600">
            选择您想要观看的播放列表
          </p>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">暂无播放列表</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player) => (
              <Link
                key={player.id}
                href={`/player/${player.pId}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {player.coverUrl && (
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={player.coverUrl}
                        alt={player.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                      {player.name}
                    </h3>
                    {player.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {player.description}
                      </p>
                    )}
                    {player.announcement && (
                      <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-yellow-800 text-xs">
                          {player.announcement}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
