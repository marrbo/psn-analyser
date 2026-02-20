// app/components/ui/TrophyMeter.tsx
'use client';

import Image from "next/image";

export default function TrophyMeter({
  data, 
  hideTotal = false, 
  showEarned = false, 
  hideLevel = false, 
  hidePlatinum = false, 
  showOnlyPsnLevel = false, 
  space = '5',
  size = 'sm'}) {
  if (!data) {
    data = {
      earnedTrophies: {
          bronze: 0,
          silver: 0,
          gold: 0,
          platinum: 0,
        },
      definedTrophies: {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
      },
      totalEarned: 0,
      totalTrophies: 0,
      completionPercentage: 0,
      trophyGroups: [],
      gameName: '',
      hideLevel: true
    }
  }

  const levels = [
    { 
      name: 'platinum', 
      color: `text-cyan-400`,
      count: data.earnedTrophies?.platinum || 0,
      total: data.definedTrophies?.platinum || 0,
      img: '/platinum.png'
    },
    { 
      name: 'gold', 
      color: 'text-yellow-500',
      count: data.earnedTrophies?.gold || 0,
      total: data.definedTrophies?.gold || 0,
      img: '/gold.png'
    },
    { 
      name: 'silver', 
      color: 'text-gray-300',
      count: data.earnedTrophies?.silver || 0,
      total: data.definedTrophies?.silver || 0,
      img: '/silver.png'
    },
    { 
      name: 'bronze', 
      color: 'text-yellow-600',
      count: data.earnedTrophies?.bronze || 0,
      total: data.definedTrophies?.bronze || 0,
      img: '/bronze.png'
    }
  ];

  const levelHidePlatinum = levels.filter((level) => level.name !== 'platinum');
  const actualLevels = hidePlatinum ? levelHidePlatinum : levels;


  const psnLevels: {
    [key: number]: { color: string },
  } = {
    0: { color: 'text-yellow-800' },
    100: { color: 'text-yellow-800' },
    200: { color: 'text-yellow-800' },
    300: { color: 'text-gray-300' },
    400: { color: 'text-gray-300' },
    500: { color: 'text-gray-300' }, 
    600: { color: 'text-yellow-400' },
    700: { color: 'text-yellow-400' },
    800: { color: 'text-yellow-400' },
    900: { color: 'text-yellow-400' },
    999: { color: 'text-cyan-400' }
  };

  const minSpace = 'min-w-' + space;
  const divSquare = 'text-center flex justify-between items-center vertical-center px-0 pb-0 pl-0 ml-1';

  const levelPsn = data?.psnLevel === 999 ? data?.psnLevel : Math.floor(data?.psnLevel / 100) * 100;
            
  const totalnew = levels.reduce((acc, level) => acc + level.count, 0);
  const total = data?.definedTrophies ? data?.definedTrophies.bronze + data?.definedTrophies.silver + data?.definedTrophies.gold + data?.definedTrophies.platinum : 0;
  hideTotal = showOnlyPsnLevel ? true : hideTotal;

  return (
      <div className={`lg:min-w-22 ${divSquare}`}>
        <div className={`flex items-center gap-3 text-${size} w-full select-none drop-shadow-xs text-shadow-black text-shadow-2xs`}>
          {/* TOTAL */}
          <div className={`${hideTotal ? 'hidden' : ''} font-medium text-white flex items-center mr-1` }>
            <Image 
                src='/total.png' 
                alt={`trophy-level-total`}
                width={20}
                height={20} 
                className="mr-2 w-5.5 inline-block"/>
              <span className={`${totalnew < 9999 || showEarned ? 'w-10' : 'w-auto'} ${minSpace} text-left text-${size}`}>
                { showEarned && (`${totalnew.toLocaleString('pt-BR')}/`)}
                {(total === 0 ? totalnew : total).toLocaleString('pt-BR')}
              </span>
          </div>
          {!showOnlyPsnLevel && (
            actualLevels.map((level) => (
              <div key={level.name} className={`${divSquare} `}>
                <div className={`font-medium ${level.color} flex items-center` }>
                  <Image 
                    src={level.img} 
                    alt={`trophy-level-${level.name}`}
                    width={20}
                    height={20} 
                    className="w-4 mr-1 inline-block"/>
                  <span className={`text-${size} ${minSpace} text-left ${level.count < 1000 ? 'w-auto' : ''}`}>
                    {(level.count).toLocaleString('pt-BR')}
                    { showEarned && (<span className={`text-${size}`}>/{(level.total).toLocaleString('pt-BR')}</span>)}
                  </span>

                </div>
              </div>
            ))
          )}
          {/* PSN LEVEL */}
          <div className={`${hideLevel ? 'hidden' : ''} font-medium ml-5 min-w-20 flex items-center`}>
            <div className={`level-sprite level-${levelPsn} mr-1`}></div>
            <span className={`font-bold text-${size} ${psnLevels[levelPsn || 100].color}`}>{data?.psnLevel}</span>
          </div>
        </div>
      </div>
    );
}