import { FaPlaystation } from "react-icons/fa";
import Image from "next/image";
import TrophyMeter from "./TrophyMeter";
import { DefinedTrophies } from "@/types/trophies";
import { PSNUser } from "@/types/psn";

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
  psnUser: PSNUser | null;
  lastOnlineDate: Date;
  avatarStatus: string;
  trophyMeter?: TrophyMeterData;
}

export default function TopBar({profilePicture = '/default-avatar.png', userName, psnUser, trophyMeter, lastOnlineDate = new Date(), avatarStatus = 'offline'} :CardProps) {
  const lastOnline = new Date(lastOnlineDate);
  const status = `avatar-${avatarStatus}`;

  return (
    <>
      <div id="TopBar" className="z-100 pt-1 h-35 text-white">
          <div className="flex m-3 h-22 lg:h-25 items-center glass-apple">
            
            {/* <div className="absolute left-3 w-35 top-1.5 flex justify-between items-center">
              <FaPlaystation className="w-12 h-12 mr-2" />
              <div className="">
                <div className={`${ububtuMono.className} text-sm  text-left italic font-semibold`}>{lastOnline?.getDate()}/{lastOnline?.getMonth() + 1}/{ lastOnline.toLocaleDateString('en-US', { year: '2-digit' })}</div>
                <div className={`opacity-60 text-[7pt] text-right italic`}>última vez online</div>
              </div>
              
            </div> */}

            {/* avatar daisyui */}
            <div className="avatar w-20 lg:w-25 pl-2 mr-3">
              <div className={`avatar ${status} rounded-full animate-ping`}></div>
              <div className={`avatar ${status}`}>
              </div>
              <div className="w-18 h-18 lg:w-22 lg:h-22 rounded-full">
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

            <div className="flex flex-col gap-0 justify-start text-xl font-semibold drop-shadow-xs text-shadow-black text-shadow-2xs">
              <span className="drop-shadow-xs text-shadow-black text-shadow-2xs flex items-center justify-between mb-5">
                <span className="mr-3">
                  {userName}
                  {psnUser?.fullProfile?.isPlus && (<Image
                    src={'/ps-plus.png'}
                    loading="eager"
                    alt="PSPlus"
                    width={15}
                    height={15}
                    className={`inline-block align-super aspect-square shrink-0 opacity-100 `}/>)}
                </span>
                
                <span className={`flex items-center text-[16pt] font-pixel text-gray-400`}><FaPlaystation className="w-4 h-4 mr-1"/> 
                  {trophyMeter?.trophyPoints?.toLocaleString('pt-BR') || '0'} 
                  <span className="text-[7pt] font-thin mt-1 ml-1"> pts</span>
                </span>
              </span>
              <div className="w-full ">
                
                <div className="hidden lg:block">
                  <TrophyMeter data={trophyMeter} hideLevel={false} hideTotal={false} size="sm" />
                </div>
                <div className="lg:hidden">
                  <TrophyMeter data={trophyMeter} hideLevel={true} hideTotal={true} size="xs" space="10" />
                </div>
              </div>
            </div>
          </div>
      </div>
    </>
  )
}