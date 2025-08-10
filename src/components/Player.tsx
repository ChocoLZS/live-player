'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Player } from '@/lib/db';

interface PlayerProps {
  player: Player;
}

declare global {
  interface Window {
    Artplayer: any;
  }
}

export default function PlayerComponent({ player }: PlayerProps) {
  const artRef = useRef<HTMLDivElement>(null);
  const artPlayerRef = useRef<any>(null);

  useEffect(() => {
    if (!artRef.current) return;

    const loadArtPlayer = async () => {
      if (!window.Artplayer) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/artplayer@5.2.5/dist/artplayer.min.js';
        script.onload = () => initPlayer();
        document.head.appendChild(script);
      } else {
        initPlayer();
      }
    };

    const initPlayer = () => {
      if (artPlayerRef.current) {
        artPlayerRef.current.destroy();
      }

      artPlayerRef.current = new window.Artplayer({
        container: artRef.current,
        url: player.url,
        title: player.name,
        poster: player.coverUrl || undefined,
        volume: 0.7,
        isLive: true,
        muted: false,
        autoplay: false,
        pip: true,
        autoSize: true,
        autoMini: true,
        screenshot: true,
        setting: true,
        loop: true,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        airplay: true,
        theme: '#00d4ff',
        lang: 'zh-cn',
        moreVideoAttr: {
          crossOrigin: 'anonymous',
        },
      });
    };

    loadArtPlayer();

    return () => {
      if (artPlayerRef.current) {
        artPlayerRef.current.destroy();
        artPlayerRef.current = null;
      }
    };
  }, [player]);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← 返回首页
            </Link>
            <h1 className="text-xl font-bold">{player.name}</h1>
          </div>
        </div>
        {player.description && (
          <p className="text-gray-300 mt-2 text-sm">{player.description}</p>
        )}
      </header>

      <div className="flex-1 bg-black">
        <div 
          ref={artRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
      </div>

      {player.announcement && (
        <div className="bg-yellow-600 text-black px-4 py-2">
          <p className="text-sm font-medium">
            📢 {player.announcement}
          </p>
        </div>
      )}
    </div>
  );
}