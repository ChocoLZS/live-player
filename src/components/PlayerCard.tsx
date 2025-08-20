'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/middleware/WithAuth';
import type { PlayerWithImageUrl } from '@/lib/db';
import toast from 'react-hot-toast';

interface PlayerCardProps {
  player: PlayerWithImageUrl;
  onEdit?: (player: PlayerWithImageUrl) => void;
  onDelete?: (player: PlayerWithImageUrl) => void;
  onCopy?: () => void;
}

export default function PlayerCard({ player, onEdit, onDelete, onCopy }: PlayerCardProps) {
  const { user } = useAuth();
  const [copying, setCopying] = useState(false);

  const coverImageSrc = player.coverImageUrl;

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(player);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this player?')) {
      return;
    }
    
    onDelete?.(player);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (copying) return;
    
    setCopying(true);
    try {
      // Create a copy of the player with a new pId
      const timestamp = Date.now();
      const newPlayer = {
        name: `${player.name} (Copy)`,
        pId: `${player.pId}_copy_${timestamp}`,
        description: player.description,
        url: player.url,
        coverUrl: player.coverUrl,
        coverImageR2Key: player.coverImageR2Key,
        announcement: player.announcement,
      };

      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlayer),
      });

      if (response.ok) {
        toast.success('Player copied successfully!');
        onCopy?.(); // Notify parent to refresh player list
      } else {
        const error = await response.json() as { error: string };
        console.error('Failed to copy player:', error);
        toast.error('Copy failed: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to copy player:', err);
      toast.error('Copy failed: Network error');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="group relative">
      <Link href={`/player/${player.pId}`} className="block">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {coverImageSrc && (
            <div className="aspect-w-16 aspect-h-9 relative">
              <img
                src={coverImageSrc}
                alt={player.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {user?.role === 'admin' && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleCopy}
                    disabled={copying}
                    className={`p-1.5 text-white rounded-full transition-colors shadow-lg ${
                      copying 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    title="Copy Player"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleEdit}
                    className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              {player.name}
            </h3>
            {player.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {player.description}
              </p>
            )}
            {player.announcement && (
              <div className="p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-yellow-800 text-xs">
                  {player.announcement}
                </p>
              </div>
            )}
            {user?.role === 'admin' && !coverImageSrc && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCopy}
                  disabled={copying}
                  className={`flex-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                    copying
                      ? 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed'
                      : 'text-green-600 bg-green-50 border border-green-200 hover:bg-green-100'
                  }`}
                >
                  {copying ? 'Copying...' : 'Copy'}
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}