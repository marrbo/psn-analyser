// app/components/Dashboard.tsx
"use client";

import StatCard from "./ui/StatCard";
import Link from "next/link";
import Image from "next/image";
import ProgressRing from "./ui/ProgressRing";
import { AnalysisData } from "@/lib/mongodb";
import { useHeader } from "@/providers/HeaderContext";
import { useEffect, useCallback, useState } from "react";
import { NormalizedScore } from "@/lib/score.types";

interface DashboardProps {
  data: AnalysisData;
  onNewAnalysis: () => void;
}

export default function Dashboard({ data, onNewAnalysis }: DashboardProps) {
  const { setTexto, setShow, setTitle, setPsnUser, setAnalysisData,
    setTrophyData, setFocusGame, setOnClick } =
    useHeader();
  const [normalizedScore, setNormalizedScore] = useState<NormalizedScore | null>(null);

  const games = Array.isArray(data?.games) ? data.games : [];

  // Verificação de segurança para games array
  // "CONCEPT_ART", "GAMEHUB_COVER_ART", "FOUR_BY_THREE_BANNER", "HERO_CHARACTER", "LOGO", "PORTRAIT_BANNER"
  
  // setFocusGame(games[0]);

  

  // Memoizar as atualizações do contexto para evitar re-renderizações desnecessárias
  const updateHeaderContext = useCallback(() => {
    setTitle("Dashboard de Análise");
    setTexto("Nova Análise");
    setShow(true);
    setPsnUser(data?.psnUser);
    setTrophyData(data?.trophySummary);
    setOnClick(onNewAnalysis);
    setAnalysisData(data);
  }, [
    data,
    onNewAnalysis,
    setTitle,
    setShow,
    setTexto,
    setPsnUser,
    setTrophyData,
    setOnClick,
    setAnalysisData
  ]);

  useEffect(() => {
    // Atualizar o contexto apenas uma vez quando o componente montar
    updateHeaderContext();

    setNormalizedScore(normalizedScore);

    // Cleanup: restaurar estado padrão ao desmontar
    return () => {
      setShow(false);
      setTexto("");
      setTitle("");
      setPsnUser(null);
      setTrophyData(null);
      setOnClick(() => {});
      setFocusGame(null);
    };
  }, [
    updateHeaderContext,
    setShow,
    setTexto,
    setTitle,
    setPsnUser,
    setTrophyData,
    setOnClick,
    setFocusGame,
    normalizedScore
  ]);

  // setFocusGame(games[0]);

  // Verificações de segurança para dados com fallbacks robustos
  if (!data) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">
            Dados de análise não encontrados
          </h1>
          <button
            onClick={onNewAnalysis}
            className="px-6 py-2 bg-linear-to-r from-green-500 to-blue-500 rounded-lg text-white"
          >
            Nova Análise
          </button>
        </div>
      </div>
    );
  }

  // EXTRAÇÃO DE DADOS COM ESTRUTURA CORRIGIDA
  // analysis agora está no nível raiz e contém migueScore, platinumGames, etc
  const trophySummary = data.trophySummary || {
    earnedTrophies: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
    totalTrophies: 0,
    trophyLevel: 0,
    progress: 0,
    tier: 1,
    hideLevel: false,
  };

  const gotyStats = data.gotyStats;

  function getCompletudeColor(progress: number): string {
    const completion = Number(progress.toFixed(0) || 0);
    switch (true) {
      case completion >= 90:
        return "text-green-400";
      case completion > 50 && completion < 89:
        return "yellow";
      default:
        return "red";
    }
  }

  function getMigueColor(progress: number): string {
    const completion = Number(progress.toFixed(0) || 0);
    switch (true) {
      case completion >= 91:
        return "text-cyan-300";
      case completion >= 71 && completion <= 90:
        return "text-purple-600";
      case completion >= 41 && completion <= 70:
        return "text-green-400";
      default:
        return "text-yellow-600";
    }
  }

  function getMigueColorBorder(progress: number): string {
    const completion = Number(progress.toFixed(0) || 0);
    switch (true) {
      case completion >= 91:
        return "border-cyan-300/20";
      case completion >= 71 && completion <= 90:
        return "border-purple-600/20";
      case completion >= 41 && completion <= 70:
        return "border-green-400/20";
      default:
        return "border-yellow-600/20";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      
      <div className={`w-full h-full justify-center`}>
        {/* Classificação Mi Mi Mi */}

        <h3 className="flex-0 text-5xl mt-4 mb-6 h-16 text-center font-bold bg-linear-to-r from-green-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
              Classificação
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-1 gap-y-6 gap-x-0 lg:gap-6 items-center px-6 pb-6">
          
          <div className={`${getMigueColorBorder(data.migueScore.totalScore)} col-span-1 hover:border-white text-center p-6 glass-effect`}>
            <div className="flex justify-between items-center space-y-0">
              <span className={`aspect-square ${data.migueScore.emoji} motion-safe:animate-pulse`}></span>
              <div className="text-left p-4 py-0">
                <div className={`text-6xl font-bold mb-4 ${getMigueColor(data.migueScore.totalScore)}`}>
                  {data.migueScore.totalScore.toFixed(1)}
                </div>
                <div className="text-xl text-gray-300">
                  {data.migueScore.classification}
                </div>
                <div className="text-xs text-gray-400">
                  {data.migueScore.description}
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown da Pontuação */}
          <div className="col-span-2 md:col-span-2 h-full grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              value={data.migueScore.completudeScore}
              label="Completude"
              color={"cyan"}
              transparent={true}
              icon="0-30 pontos"
            />
            <StatCard
              value={data.migueScore.highDifficultyScore}
              label="Dificuldade"
              color={"red"}
              transparent={true}
              icon="0-20 pontos"
            />
            <StatCard
              value={data.migueScore.highMetacriticScore}
              label="Metacritic"
              transparent={true}
              icon="0-20 pontos"
            />
            <StatCard
              value={data.migueScore.platinasScore.totalPoints}
              label="Platinas"
              transparent={true}
              icon={`0-20 pontos`}
            />
          </div>
          
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 lg:grid-cols-3 sm:grid-cols-2 gap-6 items-center justify-between px-6">
          <StatCard
            value={(data.totalGames || games.length || 0).toLocaleString(
              "pt-BR"
            )}
            label="Total de Jogos"
            icon="Jogos na Biblioteca"
            transparent={true}
            color="blue"
          />

          <StatCard
              value={data.trophySummary.earnedTrophies.platinum}
              label="Platinas"
              color={"yellow"}
              transparent={true}
              icon={`${data.migueScore.platinas100} Platinas 100%`}
            />

          <StatCard
            value={`${data.completionRate.toFixed(1)}`}
            label="Completude"
            icon={`${data.migueScore.completedGames}/${games.length} concluídos 100%`}
            color={getCompletudeColor(data.migueScore.completedGames/games.length)}
            transparent={true}
            percent={true}
          />

          {/* <StatCard
            value={gotyStats.gotyGames?.length || 0}
            label="Jogos GOTY"
            transparent={true}
            icon={`${
              (gotyStats.completedGames || 0) === 0
                ? "Nenhum"
                : gotyStats.completedGames || 0
            } GOTY 100%`}
          /> */}
        </div>

        {/* <PlatinumScoreDisplay userData={data?.migueScore.platinumData}/> */}

        {/* Jogos GOTY */}
        {/* {gotyStats.gotyGames && gotyStats.gotyGames.length > 0 && (
          <div className="mt-10 mb-10 p-4">
            <h3 className="text-5xl mt-4 mb-6 text-center h-16 font-bold bg-linear-to-r from-orange-400 to-red-700 bg-clip-text text-transparent drop-shadow-lg">
              Jogos GOTY
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 p-6 glass-effect border-2 border-orange-500/20 rounded-2xl">
              {gotyStats.gotyGames.slice(0, 4).map(
                (gotyGame: any) =>
                  gotygame?.userGame && (
                    <div
                      key={gotygame?.usergame?.npCommunicationId}
                      className="rounded-2xl p-2 group hover:bg-gray-950 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-4 glass-effect button-effect p-2">
                        <div className="text-2xl cursor-pointer">
                          <Image
                            src={
                              gotygame?.usergame?.localizedImageUrl ||
                              gotygame?.usergame?.trophyTitleIconUrl
                            }
                            alt={
                              gotygame?.usergame?.localizedName ||
                              gotygame?.titulo
                            }
                            width={250}
                            height={250}
                            className="aspect-square w-70 border-transparent hover:border-gray-500 rounded-lg object-cover-custom group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="w-full flex flex-col justify-between gap-4 align-top">
                          <h4 className="font-bold text-white text-xl">
                            {gotygame?.titulo}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {gotygame?.desenvolvedora}{" "}
                            <span className="m-2">•</span>Metacritic:{" "}
                            {gotygame?.metacritic_score}/100
                          </p>
                          <p className="text-lg text-gray-300">
                            {gotygame?.ano_premiacao}
                          </p>
                        </div>
                        <div className="col-span-1 flex items-center vertical-center w-20">
                          <Image
                            src="/platinum.png"
                            alt="Platinum Trophy"
                            width={200}
                            height={200}
                            className={`${
                              !gotygame?.usergame?.hasPlatinum &&
                              gotygame?.usergame?.gameTitle
                                ?.completionPercentage === 100
                                ? "hidden"
                                : ""
                            } ${
                              gotygame?.usergame?.earnedTrophies
                                ?.platinum > 0 || 0
                                ? ""
                                : "grayscale opacity-50"
                            }`}
                          />
                        </div>
                        <div className="text-xs text-cyan-400">
                          <ProgressRing
                            progress={
                              gotygame?.userGame?.gameTitle
                                ?.completionPercentage ||
                              gotygame?.userGame?.progress ||
                              0
                            }
                            earned={
                              gotygame?.usergame?.earnedTrophies ||
                              gotygame?.usergame?.earnedTrophies
                            }
                            total={
                              gotygame?.usergame?.totalTrophies ||
                              gotygame?.usergame?.totalTrophies
                            }
                            size={90}
                          />
                        </div>
                      </div>
                    </div>
                  )
              )}
            </div>
            {gotyStats.gotyGames.length > 4 && (
              <div className="text-center mt-4">
                <p className="text-gray-400">
                  +{gotyStats.gotyGames.length - 4} outros jogos GOTY
                </p>
              </div>
            )}
          </div>
        )} */}

        {/* Biblioteca de Jogos */}
        <div className="mb-20 p-4">
          <h3 className="text-5xl mb-6 text-center font-bold bg-linear-to-r from-gray-900 via-blue-800 to-cyan-300 h-16 bg-clip-text text-transparent drop-shadow-lg">
            <span>Jogos recentes</span>
          </h3>
          <div className="glass-effect rounded-2xl border-blue-800">
            
            {/* Preview dos primeiros 6 jogos */}
            <div className="grid grid-cols-3 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-6 gap-4 p-6">
              {games.slice(0, 5).map((game: any) => (
                <Link
                  key={game?.npCommunicationId}
                  href={`/games/${
                    game?.npCommunicationId
                  }?accountId=${data.accountId.toLocaleString()}`}
                  data-tip={game?.localizedName || game?.trophyTitleName} 
                  className="group tooltip rounded-2xl p-2 group hover:bg-gray-950 transition-colors duration-300"
                >
                  <div className="aspect-square w-full relative rounded-lg overflow-hidden glass-effect button-effect">
                    <Image
                      src={
                        game?.imageUrl || game?.localizedImageUrl ||
                        game?.TrophyTitle?.trophyTitleIconUrl
                      }
                      alt={`${game?.localizedName || game?.trophyTitleName} - ${game?.completionPercentage || 0}%`}
                      width={200}
                      height={200}
                      className="w-full h-full grayscale-80 group-hover:grayscale-0 transition-transform duration-300"
                    />
                    {/* <div className="absolute top-0 left-0 right-0 bg-linear-to-b from-black to-gray-900/10 uppercase text-shadow-xs p-2 items-center text-center">
                      <div className="text-white text-sm font-semibold truncate">
                        {game?.localizedName || game?.titulo}
                      </div>
                    </div> */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/80 to-transparent items-center text-center">
                      {/* <span className="text-right absolute bottom-2 right-2 bg-gray-900/70 rounded-full px-2 py-1 text-xs">{game?.completionPercentage || game?.progress || 0}%</span> */}

                      <span className="text-right absolute bottom-0 right-1">
                        <ProgressRing
                          progress={
                            game?.completionPercentage ||
                            game?.progress ||
                            0
                          }
                          earned={game?.earnedTrophies}
                          total={game?.totalTrophies}
                          fillColor="white/10"
                          textSize={8}
                          size={80}
                        />
                      </span>
                      <div className="text-center rounded-full px-2 py-1 w-12 text-xs text-white font-semibold bg-gray-900/70">
                        <span className="text-center">
                          {game?.trophyTitlePlatform}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
                <Link
                  href={`/games?analysisId=${data._id}&accountId=${data.accountId}`}
                  data-tip="Todos os Jogos" 
                  className="tooltip group rounded-2xl p-2 group hover:bg-gray-950 transition-colors duration-300 aspect-square"
                >
                  <div className="rounded-lg h-full w-full items-center text-center text-2xl flex flex-col justify-center gap-4 hover:text-yellow-600 transition-colors duration-300 glass-effect button-effect grayscale group-hover:grayscale-0">
                    <p>🎮</p> 
                    <p>Todos ...</p>
                    <p className="text-blue-200 text-lg">
                      ({(games.length || 0).toLocaleString("pt-BR")})
                    </p>
                  </div>
                </Link>
            </div>
          </div>

        </div>
        

        {/* Informações de Debug (apenas desenvolvimento) */}
        {process.env.NODE_ENV === "development" && (
          <div className="glass-effect rounded-2xl mb-20 border-2 border-gray-500/20 gap-6 items-center p-4">
            <h3 className="text-xl font-bold text-white mb-4">
              🔧 Informações de Debug
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>Total de jogos:</strong>{" "}
                  {games.length.toLocaleString("pt-BR")}
                </p>
                <p>
                  <strong>Platinas:</strong>{" "}
                  {data.trophySummary.earnedTrophies.platinum.toLocaleString(
                    "pt-BR"
                  ) || 0}
                </p>
                <p>
                  <strong>Jogos GOTY:</strong> {gotyStats.totalGotyGames || 0}
                </p>
              </div>
              <div>
                <p>
                  <strong>Level PSN:</strong> {trophySummary.trophyLevel || 0}
                </p>
                <p>
                  <strong>Trofeus totais:</strong>{" "}
                  {trophySummary.totalTrophies.toLocaleString("pt-BR") || 0}
                </p>
                <p>
                  <strong>Account ID:</strong> {data?.psnUser?.accountId}
                </p>
                <p>
                  <strong>Username:</strong> {data.username}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
