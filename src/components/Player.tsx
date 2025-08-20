'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Player, PlayerWithImageUrl } from '@/lib/db';
import Artplayer from "artplayer";
import type { Option } from "artplayer/types/option";
import Hls from "hls.js";
import artplayerPluginHlsControl from 'artplayer-plugin-hls-control';
import toast from 'react-hot-toast';

function _Artplayer({
  option,
  getInstance,
  ...rest
}: {
  option: Omit<Option, "container">;
  getInstance?: (art: Artplayer) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const artRef = useRef<HTMLDivElement | null>(null);
  
  const playM3u8 = useCallback(
    (video: HTMLVideoElement, url: string, art: Artplayer) => {
      if (Hls.isSupported()) {
        if (art.hls) art.hls.destroy();
        const originUrlObj = new URL(url);
        const queryParms = originUrlObj.searchParams;
        const hls = new Hls({
          xhrSetup(xhr, tsUrl) {
            if (tsUrl.includes(".ts") || tsUrl.endsWith(".m3u8")) {
              const tsUrlObj = new URL(tsUrl);
              queryParms.forEach((value, key) => {
                tsUrlObj.searchParams.set(key, value);
              });
              xhr.open("GET", tsUrlObj.toString(), true);
            }
          },
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        art.hls = hls;
        art.on("destroy", () => hls.destroy());
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else {
        art.notice.show = "Unsupported playback format: m3u8";
      }
    },
    []
  );

  useEffect(() => {
    const art = new Artplayer({
      ...option,
      container: artRef.current || "",
      customType: {
        m3u8: playM3u8,
      },
      plugins: [
        artplayerPluginHlsControl({
          quality: {
            control: true,
            setting: true,
            getName: (level: any) => level.height + 'P',
            // I18n
            title: 'Quality',
            auto: 'Auto',
          },
          audio: {
              // Show audios in control
              control: true,
              // Show audios in setting
              setting: true,
              // Get the audio name from track
              getName: (track: any) => track.name,
              // I18n
              title: 'Audio',
              auto: 'Auto',
          }
        })
      ]
    });
    
    if (getInstance && typeof getInstance === "function") {
      getInstance(art);
    }

    return () => {
      console.log('destroy outside')
      if (art && art.destroy) {
        console.log('destroy inside')
        art.destroy(false);
      }
    };
  }, []);

  return <div ref={artRef} {...rest}></div>;
}

interface PlayerProps {
  player: PlayerWithImageUrl;
}

export default function PlayerComponent({ player }: PlayerProps) {
  const artPlayerRef = useRef<any>(null);
  const [copying, setCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const posterImageSrc = player.coverImageUrl;

  const handleCopyPlayer = async () => {
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
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
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

  const playerOption: Omit<Option, "container"> = {
    url: player.url,
    poster: posterImageSrc,
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
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Home
            </Link>
            <h1 className="text-xl font-bold">{player.name}</h1>
          </div>
          <button
            onClick={handleCopyPlayer}
            disabled={copying}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              copySuccess 
                ? 'bg-green-600 text-white' 
                : copying 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="Copy Player"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
              />
            </svg>
            <span>
              {copySuccess ? 'Copied!' : copying ? 'Copying...' : 'Copy Player'}
            </span>
          </button>
        </div>
        {player.description && (
          <p className="text-gray-300 mt-2 text-sm">{player.description}</p>
        )}
      </header>

      <div className="flex-1 bg-black">
        <_Artplayer
          option={playerOption}
          getInstance={(art) => {
            artPlayerRef.current = art;
          }}
          className="w-full h-full flex"
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