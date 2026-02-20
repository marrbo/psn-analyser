import { FaPlaystation } from "react-icons/fa";
import Image from "next/image";
import { Ubuntu_Mono } from "next/font/google";
import TrophyMeter from "./TrophyMeter";
import { DefinedTrophies } from "@/types/trophies";


const ububtuMono = Ubuntu_Mono({
  weight: [ "400", "700"],
  fallback: ["Arial", "sans-serif"],
  subsets: ["latin"],
  display: "swap",
  preload: true
})

export interface TrophyMeterData {
    psnLevel: number;
    earnedTrophies: DefinedTrophies;
    definedTrophies: DefinedTrophies;
    completionPercentage: number;
    totalTrophies: number;
    trophyPoints?: number;
  }

interface CardProps {
  profilePicture: string;
  userName?: string;
  accountId?: string;
  lastOnlineDate: Date;
  avatarStatus: string;
  trophyMeter?: TrophyMeterData;
}

export default function Card({profilePicture = '/default-avatar.png', userName, trophyMeter, lastOnlineDate = new Date(), avatarStatus = 'offline'} :CardProps) {
  const lastOnline = new Date(lastOnlineDate);
  const status = `avatar-${avatarStatus}`;

  return (
    <a href="#" className="z-20 hover-3d mt-12 cursor-pointer hover:shadow-2xl shadow-blue-200 opacity-75 hover:opacity-100">
      <div className="group card w-86 bg-radial-[at_15%_15%] from-gray-500 to-zinc-900 to-60% border-r-2 border-b-2 border-r-gray-300/60 border-b-gray-300/60 border-t border-t-gray-300/40 border-l border-l-gray-300/40 text-white">
        
        <div className="card-body playgrid-background">
          <div className="flex justify-between">
            <div className="font-bold text-gray-800">
              <FaPlaystation className="w-12 h-12" />
            </div>
            
            <div>
              {/* avatar daisyui */}
              <div className="avatar">
                <div className={`avatar ${status} rounded-full animate-ping`}></div>
                <div className={`avatar ${status}`}>
                </div>
                <div className="w-20 rounded-full">
                  <Image
                    src={profilePicture}
                    loading="eager"
                    alt="Logo"
                    width={100}
                    height={100}
                    className={`aspect-square shrink-0 opacity-100 `}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={`${ububtuMono.className} mt-[-20] mb-4 font-bold text-2xl text-left`}>
            <div className="truncate drop-shadow-xs text-shadow-black text-shadow-2xs mb-2">{userName}</div>
            <TrophyMeter data={trophyMeter} hideTotal={true} hideLevel={true} size="sm" />
            {/* <div className={`${ububtuMono.className} text-lg opacity-40 mb-4 font-bold text-left`}>{formatCardNumber(accountId || '00000000000000000000')}</div> */}
          </div>
          <div className="flex justify-between items-center">
            <div className={`${ububtuMono.className} w-30 text-left  -mb-2`}>
              <TrophyMeter data={trophyMeter} showOnlyPsnLevel={true} size="lg" />
            </div>
            <div>
              <span className={`${ububtuMono.className} text-lg font-bold text-white/70 -ml-10 text-left flex items-center justify-left gap-1 -mb-3.5`}>
                <FaPlaystation className="w-4 h-4" /> {trophyMeter?.trophyPoints?.toLocaleString('pt-BR') || '0'} <span className="text-xs font-thin">pts</span>
              </span>
            </div>
            
            <div className="-mb-4">
              <div className={`${ububtuMono.className} text-sm  text-right italic font-semibold`}>{lastOnline?.getDate()}/{lastOnline?.getMonth() + 1}/{ lastOnline.toLocaleDateString('en-US', { year: '2-digit' })}</div>
              <div className={`opacity-60 text-[7pt] text-right italic`}>última vez online</div>
            </div>
          </div>
        </div>
      </div>
      
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </a>);
}