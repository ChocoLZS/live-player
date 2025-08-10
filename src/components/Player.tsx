'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Player } from '@/lib/db';
import Artplayer from "artplayer";
import type { Option } from "artplayer/types/option";
import Hls from "hls.js";

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
    });
    
    if (getInstance && typeof getInstance === "function") {
      getInstance(art);
    }

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, []);

  return <div ref={artRef} {...rest}></div>;
}

interface PlayerProps {
  player: Player;
}

export default function PlayerComponent({ player }: PlayerProps) {
  const artPlayerRef = useRef<any>(null);

  const playerOption: Omit<Option, "container"> = {
    url: player.url,
    poster: player.coverUrl || '',
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