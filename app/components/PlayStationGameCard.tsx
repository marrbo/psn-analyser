// components/PlayStationGameCard.tsx
'use client';

import { ExtractedGameData } from '@/types/playstation';
import Image from 'next/image';

interface PlayStationGameCardProps {
  game: ExtractedGameData;
}

export function PlayStationGameCard({ game }: PlayStationGameCardProps) {
  const getPrimaryImage = () => {
    return (
      game.media.portraitBanner ||
      game.media.master ||
      game.media.editionKeyArt ||
      game.media.gamehubCoverArt ||
      
      '/placeholder-game.jpg'
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-50 w-full">
        <Image
          src={getPrimaryImage()}
          alt={game.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        
        
        />
        {/* {game.media.logo && (
          <div id="logo" className="flex justify-center items-center w-full">
            <AutoTrimImage 
              src={game.media.logo} 
              maskImage={false}
              className="bg-center absolute top-2 left-2 right-2 w-30 h-30"/>
          </div>
          )} */}
        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
          <span className="text-xs font-semibold text-white">
            {game.storeDisplayClassification || 'Game'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2 truncate">
          {game.name}
        </h3>
        
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-400 mb-1">Platforms:</h4>
          <div className="flex flex-wrap gap-1">
            {game.platforms.map((platform) => (
              <span
                key={`${game.id}-${platform}`}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
        
        {/* {game.highlight.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-1">Search Match:</h4>
            <p className="text-sm text-gray-300">
              {game.highlight.map((part, index) => (
                <span
                  key={index}
                  className={part.toLowerCase().includes(game.name.toLowerCase()) 
                    ? 'bg-yellow-500/30 text-yellow-300' 
                    : 'text-gray-300'
                  }
                >
                  {part}
                </span>
              ))}
            </p>
          </div>
        )} */}
        
        {/* <div className="grid grid-cols-2 gap-2">
          {game.media.preview && (
            <a
              href={game.media.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-center py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Watch Trailer
            </a>
          )}
        </div> */}
      </div>
    </div>
  );
}