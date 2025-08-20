'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminControls from '@/components/AdminControls';
import AddPlayerButton from '@/components/AddPlayerButton';
import PlayerCard from '@/components/PlayerCard';
import PlayerModal from '@/components/PlayerModal';
import { useAuth } from '@/middleware/WithAuth';
import type { Player, PlayerWithImageUrl } from '@/lib/db';
import toast from 'react-hot-toast';

export default function Home() {
  const [players, setPlayers] = useState<PlayerWithImageUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerWithImageUrl | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      if (response.ok) {
        const data = await response.json() as PlayerWithImageUrl[];
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setModalOpen(true);
  };

  const handleEditPlayer = (player: PlayerWithImageUrl) => {
    setEditingPlayer(player);
    setModalOpen(true);
  };

  const handleDeletePlayer = async (player: PlayerWithImageUrl) => {
    try {
      const response = await fetch(`/api/players/${player.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setPlayers(prev => prev.filter(p => p.id !== player.id));
      } else {
        const error = await response.json();
        toast.error((error as { error: string }).error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error('Delete failed');
    }
  };

  const handleSubmitPlayer = async (playerData: Omit<PlayerWithImageUrl, 'id' | 'createdAt' | 'updatedAt' | 'coverImageUrl'>) => {
    setSubmitting(true);
    
    try {
      const isEditing = !!editingPlayer;
      const url = isEditing ? `/api/players/${editingPlayer.id}` : '/api/players';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(playerData)
      });

      if (response.ok) {
        const savedPlayer = await response.json() as PlayerWithImageUrl;
        
        if (isEditing) {
          setPlayers(prev => prev.map(p => p.id === editingPlayer.id ? savedPlayer : p));
        } else {
          setPlayers(prev => [savedPlayer, ...prev]);
        }
        
        setModalOpen(false);
        setEditingPlayer(null);
      } else {
        const error = await response.json();
        toast.error((error as { error: string }).error || (isEditing ? 'Update failed' : 'Create failed'));
      }
    } catch (error) {
      console.error('Error submitting player:', error);
      toast.error(editingPlayer ? 'Update failed' : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            楽しみましょう
          </h1>
          <AdminControls />
        </div>

        {players.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No players found</p>
            {user?.role === 'admin' && (
              <AddPlayerButton onClick={handleAddPlayer} variant="card" />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onEdit={handleEditPlayer}
                onDelete={handleDeletePlayer}
              />
            ))}
            {user?.role === 'admin' && (
              <AddPlayerButton onClick={handleAddPlayer} variant="card" />
            )}
          </div>
        )}
      </div>

      <PlayerModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPlayer(null);
        }}
        onSubmit={handleSubmitPlayer}
        player={editingPlayer}
        loading={submitting}
      />
    </div>
  );
}