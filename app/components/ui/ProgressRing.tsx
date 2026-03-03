// app/components/ui/ProgressRing.tsx
'use client';

import { DefinedTrophies } from '@/types/trophies';
import { useRef, useEffect, useState } from 'react';
import { FaTrophy } from 'react-icons/fa';

interface ProgressRingProps {
  progress: number | undefined;
  earned?: DefinedTrophies;
  total?: number;
  size?: number;
  hideValue?: boolean;
  textSize?: number;
  onlyText?: boolean;
  showTrophy?: boolean;
  fillColor?: string;
}

export default function ProgressRing({ 
    progress = 0, 
    earned = { bronze: 0, silver: 0, gold: 0, platinum: 0 }, 
    total = 0, 
    size = 100, 
    hideValue = false, 
    textSize = 12,
    onlyText = false,
    showTrophy = false,
    fillColor = 'transparent',
   }: ProgressRingProps) {

  const [progressOffset, setProgressOffset] = useState(0);
  const progressOffsetRef = useRef(progressOffset);
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const totalEarned = earned.bronze + earned.silver + earned.gold + earned?.platinum || 0;
  const textSizeClass = `text-[${textSize + 4}pt]`;
  const textSmallClass = `text-[${textSize - 2}pt]`;
  const sizeTrophy = ((20 / size) * 0.5 * 100).toPrecision(1); // Ajusta o tamanho do troféu proporcionalmente ao tamanho do anel
  const trophySize = `w-${sizeTrophy} h-${sizeTrophy}`;
  console.log('trophySize:', trophySize);

  useEffect(() => {
    progressOffsetRef.current = circumference - (progress / 100) * circumference;
    setProgressOffset(progressOffsetRef.current);
  }, [progress, circumference]);

  if (onlyText) {
    return (
    <>
      <div className={`min-h-12 mt-1 flex justify-center text-center ${progress >= 100 ? 'text-green-500' : progress >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
        <span className={`${textSizeClass} font-bold`}>{progress}
          <span className="inline-block align-baseline text-xs">%</span>
        </span>
        {/* <span className={`-mt-1 -ml-2 ${textSmallClass}`}>{totalEarned}/{total}</span> */}
      </div>
    </>)
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-600"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill={fillColor}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute text-center items-center flex flex-row grid grid-rows-2 line">
        {showTrophy ? (
          <div className='w-full flex items-center justify-center'>
            <FaTrophy className={`${trophySize}`}/>
          </div>
        ) 
        : (
          <span className={`${hideValue ? 'hidden' : ''} ${textSizeClass} font-bold text-white`}>{progress}
            <span className={`text-xs inline-block align-baseline text-gray-300`}>%</span>
          </span>
        )}
        <span className={`${textSmallClass} text-gray-200 font-thin mt-1`}>{totalEarned}/{total}</span>
      </div>
    </div>
  );
}