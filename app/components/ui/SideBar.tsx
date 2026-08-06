import { useHeader } from "@/providers/HeaderContext";
import AutoTrimImage from "./AutoTrimImage";
import { FaClock, FaGamepad } from "react-icons/fa";
import PlatinumScoreDisplay from "@/app/components/ui/PlatinumScore";
import { SiMetacritic } from "react-icons/si";
import { TbTrophy } from "react-icons/tb";
import DurationDisplay from "./DurationDisplay";
import ProgressRing from "./ProgressRing";
import { ptBR } from 'date-fns/locale';
import { RxValueNone } from "react-icons/rx";
import { formatDistanceToNow } from 'date-fns';

export default function SideBar({ show }: { show?: boolean }) {
  const {
    logoImage: contextLogoImage,
    focusGame,
    analysisData: contextAnalysisData,
    bgFullImage: contextBgFullImage,
  } = useHeader();

  const totalTrophies =
    (focusGame?.trophyTitle?.definedTrophies.bronze || 0) +
    (focusGame?.trophyTitle?.definedTrophies.silver || 0) +
    (focusGame?.trophyTitle?.definedTrophies.gold || 0) +
    (focusGame?.trophyTitle?.definedTrophies.platinum || 0);

  // const platinum = focusGame?.trophyTitle?.trophyGroups[0]?.trophies.find(
  //   (trophy) => trophy.trophyType === "platinum",
  // );
  // const platinumRate = platinum?.trophyEarnedRate;

  if (!show) return null;

  const classificacao = (rated: string) => {
    switch (rated.toUpperCase()) {
      case "E":
      case "L":
      case "L (LIVRE)":
        return "bg-green-600";
      case "E10+":
      case "10":
      case "10+":
        return "bg-cyan-600";
      case "T":
      case "12+":
        return "bg-yellow-600";
      case "M":
      case "16+":
        return "bg-red-600";
      case "AO":
      case "18+":
        return "bg-black";
      default:
        return "bg-black/50";
    }
  };

  const playedTime = focusGame?.playDuration || "0";
  const showGameInfo = globalThis?.location?.pathname?.includes("/dashboard/") || false;

  let lastPlayed = focusGame?.lastPlayedDateTime ? 
    formatDistanceToNow(new Date(focusGame?.lastPlayedDateTime || '1970-01-01T00:00:00.000Z'), {
      locale: ptBR,

      addSuffix: true,
    }) : '';

  lastPlayed = lastPlayed.replace('há cerca de ', 'Há ');
  lastPlayed = lastPlayed.replace(' horas', ' h');
  lastPlayed = lastPlayed.replace(' hora', ' h');


  return (
    <>
      <div
        id="SideBar-shadow"
        className="-z-3 pt-0 -top-30 -left-10 w-110 absolute bg-linear-90 from-black-600/80 via-black/50 via-60% to-transparent text-white"
      ></div>
      <div
        className="aspect-square rounded-lg w-100 h-120 mb-6 text-white"
        style={{
          backgroundImage: `url(${contextBgFullImage})`,
          backgroundSize: "cover",
          filter: "saturate(120%) brightness(80%)",
          backgroundPosition: "center",
        }}
      >
        
        {/* <div className="border-none bg-linear-180 from-black/90 via-10% via-black/30 to-black w-100 h-120 rounded-lg"/> */}
        <div className="border-none bg-radial-[at_50%_30%] from-transparent via-10% via-black/10 to-black w-100 h-120 rounded-lg"/>

        <div className="p-5 w-100 h-120 border border-white/10
          absolute top-0 left-0 right-0 rounded-lg animate-shine-apple">
          
          {/* Conteúdo */}
          <div className="flex items-center justify-between mb-10">
            <span className="flex items-center gap-2 font-bold">
              <FaGamepad className="w-6 h-6 text-white"/> Última sessão de jogo
            </span>
            <span className="font-light">
              {lastPlayed}
            </span>
          </div>

          <AutoTrimImage
              src={contextLogoImage}
              maskImage={false}
              position="center"
              className="w-full scale-95 h-28 mb-12 px-3 object-cover-custom"
            />
          
          <span className="font-bold text-[1.3rem] shadow-xs text-shadow-black/50 text-shadow-xs">
            {focusGame?.localizedName}
          </span>

          <div className="flex flex-col mt-5 lg:flex-row px-2">
            
            { playedTime !== '0' ? (
                <div className="flex flex-col justify-start gap-2 w-75 font-thin text-white/80">
                
                  <span className="flex flex-col lg:flex-row gap-2">
                    <div className="flex items-center justify-center">
                      <FaClock className="w-7 h-7 mt-1"/>
                    </div>
                    <div>
                      <p>Tempo jogado</p>
                      <p className="font-thin"><DurationDisplay
                        isoDuration={playedTime}
                        format="hours"/></p>
                    </div>
                  </span> 
                  
                  <span className="flex flex-col lg:flex-row gap-2">
                    <div className="flex items-center justify-center">
                      <FaGamepad className="w-7 h-7 mt-1"/>
                    </div>
                    <div>
                      <p>Sessões jogadas</p>
                      <p className="font-thin">
                        {focusGame?.playCount || 0}
                      </p>
                    </div>
                    
                  </span> 
{/* 
                  <span className="flex flex-col lg:flex-row gap-2">
                    <div className="flex items-center justify-center">
                      <FaTrophy className="w-7 h-7 mt-1"/>
                    </div>
                    <div>
                      <p>Progresso troféus</p>
                      <p className="font-thin">
                        {focusGame?.completionPercentage}%
                      </p>
                    </div>
                  </span> */}

                  <span className="flex flex-col lg:flex-row gap-2">
                    <div className="flex items-center justify-center">
                      <SiMetacritic className="w-7 h-7"/>
                    </div>
                    <div>
                      <p>Metacritic</p>
                      <p className="font-thin">
                        {focusGame?.trophyTitle?.metacritic?.metascore}/100
                      </p>
                    </div>
                  </span> 
                </div>
            ) : <div className="w-75"></div> }

            <div className="w-28 mt-10">
              <ProgressRing
                progress={focusGame?.trophyTitle?.progress}
                total={(focusGame?.trophyTitle?.definedTrophies?.bronze || 0) 
                  + (focusGame?.trophyTitle?.definedTrophies?.silver || 0) 
                  + (focusGame?.trophyTitle?.definedTrophies?.gold || 0) 
                  + (focusGame?.trophyTitle?.definedTrophies?.platinum || 0)}
                earned={focusGame?.earnedTrophies || focusGame?.trophyTitle?.earnedTrophies}
                hideValue={false}
                showTrophy={true}
                textSize={30}
                size={120}
              />
            </div>

          </div>
        </div>
      </div>


      
      {/* Game Info */}
      {!showGameInfo && (
      <div
        id="SideBar"
        className="z-20 p-5 w-100 glass-apple-dark min-h-60 space-y-6 text-white"
      >
        {/* Game Logo image
        {contextLogoImage && (
          <div className="h-15 text-white w-full mb-6 flex items-center justify-between pt-3">
            <AutoTrimImage
              src={contextLogoImage}
              maskImage={false}
              position="left center"
              className="w-full h-full px-3 object-cover-custom"
            />
            <Image
              src={`/${focusGame?.trophyTitlePlatform.substring(0, 3)}-controller.png`}
              alt="Logo"
              width={100}
              height={100}
              className="object-cover-custom p-3 bg-center w-20 h-15"
            />
            <div className="divider"></div>
          </div>
        )} */}

        {/* Capa e Plataforma */}
        {/* <div className="h-40 w-full flex items-center justify-between gap-3">
          <Image
            src={contextCoverImage}
            alt="Logo"
            width={100}
            height={100}
            className="object-cover glass-effect w-20 h-20"
          />
        </div> */}

        {/* Description */}
        {/* {focusGame?.metacritic?.description && (
          <div className="flex items-center justify-between gap-4 h-30">
            <div className="w-full">
              <p className="text-xs font-mono text-gray-400 mb-2">
                description:{" "}
              </p>
              <p className="text-xs rounded-lg min-h-20 max-h-25 overflow-y-auto text-justify">
                {focusGame?.metacritic?.description}
              </p>
            </div>
          </div>
        )} */}

        {/* Metacritic */}
        <div className="flex items-center justify-between gap-4">
          <div className="w-40">
            <p className="text-xs font-mono text-gray-400">metacritic: </p>
            <p className="font-pixel text-3xl gap-1 flex items-center">
              <SiMetacritic className="w-4.5 h-4.5" />
              {focusGame?.trophyTitle?.metacritic?.metascore}/100
            </p>
          </div>

          {/* <div className="w-40 text-right">
            <p className="text-xs font-mono text-gray-400">Plataform Code: </p>
            <p className="font-pixel text-3xl">{focusGame?.npCommunicationId}</p>
          </div> */}

          <div className="w-40 text-right">
            <p className="text-xs font-mono text-gray-400">DLCs: </p>
            <p className="font-pixel text-3xl flex items-end justify-end gap-2 mr-3 mt-1">
              {(focusGame?.trophyTitle?.trophyGroupCount || 1) - 1 <= 1
                ? <RxValueNone className="w-6 h-6"/>
                : (focusGame?.trophyTitle?.trophyGroupCount || 2) - 1}
            </p>
          </div>
        </div>

        {/* PlayTime */}
        <div className="flex items-center justify-between gap-4">
          <div className="w-40">
            <p className="text-xs font-mono text-gray-400">trophies: </p>
            <p className="font-pixel text-3xl gap-1 flex items-center">
              <TbTrophy className="w-5 h-5" />
              {totalTrophies}
            </p>
          </div>

          <div className="w-40 text-right">
            <p className="text-xs font-mono text-gray-400">trophy set: </p>
            <p className="font-pixel text-3xl">{focusGame?.trophyTitle?.trophySetVersion}</p>
          </div>
        </div>

        {/* Platinum Rate */}
        <div className="flex items-center justify-between gap-4">
          {/* <div className="w-40">
            <p className="text-xs font-mono text-gray-400">platinum rate: </p>
            <p className="font-pixel text-3xl flex items-center justify-start gap-2">
              <FaPlaystation className="w-5 h-5" /> {platinumRate}%
            </p>
          </div> */}
          
          <div className="w-40 text-right">
            <p className="text-xs font-mono text-gray-400">classificação: </p>
            <p className="flex items-end justify-end">
              <span
                className={`mt-2 font-bold w-11 h-10 pt-1 px-1 rounded-md text-center text-2xl ${classificacao(focusGame?.trophyTitle?.metacritic?.rated || "PE")} `}
              >
                {(focusGame?.trophyTitle?.metacritic?.rated_br || "RP")
                  .toUpperCase()
                  .substring(0, 2)}
              </span>
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Platinum Score */}
      {showGameInfo && (
        <div className="z-20 w-100 min-h-50 mt-6">
        <PlatinumScoreDisplay
          userData={contextAnalysisData?.migueScore?.platinumData}
        />
      </div>
      )}
      
    </>
  );
}
