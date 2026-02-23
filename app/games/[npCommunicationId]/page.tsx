// app/games/[npCommunicationId]/page.tsx
"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import TrophyMeter from "@/app/components/ui/TrophyMeter";
import ProgressRing from "@/app/components/ui/ProgressRing";
import TrophyFilters, { TrophyFiltersState } from "@/app/components/TrophyFilters";
import Image from "next/image";
import { getPlatform, useHeader } from "@/providers/HeaderContext";
import { TrophyDetail, TrophyGroup } from "@/types/trophies";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import { FaAdjust, FaAward, FaCalendar, FaEye, FaEyeSlash, FaLock, FaLockOpen } from "react-icons/fa";

function GameDetailPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const {
    setShow,
    setTitle,
    setOnClick,
    setTexto,
    setPsnUser,
    setFocusGame,
    focusGame: game,
    setTrophyData,
    setBackgroundImage,
    setLogoImage,
    setHeroImage,
    setAnalysisData,
    analysisData,
  } = useHeader();

  const [totalEarned, setTotalEarned] = useState(0);
  const [totalDefined, setTotalDefined] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [filters, setFilters] = useState<TrophyFiltersState>({
    type: [], // bronze, silver, gold, platinum
    status: [], // earned, not-earned
  });
  const [sortBy, setSortBy] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDLCs, setShowDLCs] = useState(true);

  useEffect(() => {
    const npCommunicationId = params.npCommunicationId as string;
    const accountId = searchParams.get("accountId");

    const backToGamesList = () => {
      router.back();
    };

    setOnClick(backToGamesList);
    setShow(true);
    setTexto("Voltar para Jogos");

    if (!accountId) {
      router.push("/");
      return;
    }

    const fetchGameDetails = async (
      npCommunicationId: string,
      accountId: string
    ) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/games/${npCommunicationId}?accountId=${accountId}`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar detalhes do jogo");
        }

        const data = await response.json();
        setAnalysisData(data);
        setFocusGame(data.games[0]);
        
        // if (!data.games[0].backgroundImage) {
        //   const backgroundImage =
        //     game?.localizedImageUrl ||
        //     game?.concept?.media.images.find(
        //       (a) => a.type === "GAMEHUB_COVER_ART",
        //     )?.url ||
        //     game?.concept?.media.images.find(
        //       (a) => a.type === "BACKGROUND_LAYER_ART",
        //     )?.url ||
        //     game?.concept?.media.images[1]?.url ||
        //     game?.trophyTitle.trophyTitleIconUrl ||
        //     "/default-game-cover.webp";
          
        //   data.games[0].backgroundImage = backgroundImage;
        // }

        // setBackgroundImage(data.games[0].backgroundImage);

        // if (data.games[0].logoImage) {
        //   setLogoImage(data.games[0].logoImage);
        // } else {
        //   setLogoImage(null);
        // }

        // if (data.games[0].heroImage) {
        //   setHeroImage(data.games[0].heroImage);
        // } else {
        //   setHeroImage(null);
        // }

        setTitle(`Detalhes do Jogo: ${data.games[0].localizedName}`);
        setPsnUser(data.psnUser);
        setTrophyData(data.trophySummary);
        setTotalEarned(
          data.games[0].trophyTitle.earnedTrophies.bronze +
            data.games[0].trophyTitle.earnedTrophies.silver +
            data.games[0].trophyTitle.earnedTrophies.gold +
            data.games[0].trophyTitle.earnedTrophies.platinum
        );

        setTotalDefined(
          data.games[0].trophyTitle.definedTrophies.bronze +
            data.games[0].trophyTitle.definedTrophies.silver +
            data.games[0].trophyTitle.definedTrophies.gold +
            data.games[0].trophyTitle.definedTrophies.platinum
        );
      } catch (error) {
        console.error("Erro ao carregar detalhes do jogo:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetails(npCommunicationId, accountId);
  }, [
    params.npCommunicationId,
    searchParams,
    router,
    setOnClick,
    setShow,
    setTexto,
    setTitle,
    setPsnUser,
    setTrophyData,
    setFocusGame,
    setBackgroundImage,
    setLogoImage,
    setHeroImage,
    setAnalysisData
  ]);

  // Função para manipular mudanças nos filtros
  // No componente GameDetailPageContent
  const handleFilterChange = (key: keyof TrophyFiltersState, value: string) => {
    setFilters((prev) => {
      if (value === "reset") {
        // Reseta o array específico
        return {
          ...prev,
          [key]: [],
        };
      }

      const currentArray = prev[key];

      // Se for "all", limpa o array
      if (value === "all") {
        return {
          ...prev,
          [key]: [],
        };
      }

      // Para "type": comportamento de checkbox com múltipla seleção
      if (key === "type") {
        // Se já existe, remove (toggle off)
        if (currentArray.includes(value)) {
          return {
            ...prev,
            [key]: currentArray.filter((item) => item !== value),
          };
        } else {
          // Adiciona o novo valor
          return {
            ...prev,
            [key]: [...currentArray, value],
          };
        }
      }

      // Para "status": comportamento de radio button
      if (key === "status") {
        // Se já está selecionado, desmarca (volta para "all")
        if (currentArray.includes(value)) {
          return {
            ...prev,
            [key]: [],
          };
        } else {
          // Seleciona apenas esse (remove outros)
          return {
            ...prev,
            [key]: [value],
          };
        }
      }

      return prev;
    });
  };

  // Função para aplicar filtros e ordenação
  const filteredTrophyGroups = useMemo(() => {
    if (!game || !game.trophyGroups) return [];

    const returnData =  game?.trophyGroups?.map((group: TrophyGroup) => {
        // Se não mostrar DLCs e não for o grupo default, retornar grupo vazio
        if (!showDLCs && group.trophyGroupId !== "default") {
          return { ...group, trophies: [] };
        }

        let filteredTrophies = [...group?.trophies || []];

        // Aplicar filtro por tipo
        if (filters.type.length > 0) {
          filteredTrophies = filteredTrophies.filter((trophy: TrophyDetail) =>
            filters.type.includes(trophy.trophyType.toLowerCase())
          );
        }

        // Aplicar filtro por status
        if (filters.status.length > 0) {
          filteredTrophies = filteredTrophies.filter((trophy: TrophyDetail) => {
            
            const isEarned = trophy.earned;
            const isProgress = (trophy.progress || 0) > 0;
            const isHidden = (trophy.trophyHidden && trophy.earned) || (trophy.trophyHidden && !trophy.earned) 
            || (trophy.trophyHidden && isProgress) || (trophy.trophyHidden && !isProgress);


            if (filters.status.includes("hidden")) {
              return filters.status.includes(isHidden ? "hidden" : "not-earned");  
            } else 
            if (filters.status.includes("progress")) {
              return filters.status.includes(isProgress ? "progress" : "not-earned");  
            } else 
            {
              return filters.status.includes(isEarned ? "earned" : "not-earned");
            }
          });
        }

        // Aplicar busca por texto
        if (searchTerm.trim() !== "") {
          const term = searchTerm.toLowerCase().trim();
          filteredTrophies = filteredTrophies.filter(
            (trophy: TrophyDetail) =>
              trophy.trophyName.toLowerCase().includes(term) ||
              trophy.trophyDetail.toLowerCase().includes(term)
          );
        }

        // Aplicar ordenação
        filteredTrophies.sort((a: TrophyDetail, b: TrophyDetail) => {
          switch (sortBy) {
            case "recent":
              // Ordenar por data de conquista (mais recente primeiro), não conquistados no final
              if (a.earned && b.earned) {
                return (
                  new Date(`${b.earnedDateTime}`).getTime() -
                  new Date(`${a.earnedDateTime}`).getTime()
                );
              }
              if (a.earned && !b.earned) return -1;
              if (!a.earned && b.earned) return 1;
              return 0;

            case "earned-recent":
              // Apenas data da conquista (mais recente primeiro)
              if (a.earned && b.earned) {
                return (
                  new Date(`${b.earnedDateTime}`).getTime() -
                  new Date(`${a.earnedDateTime}`).getTime()
                );
              }
              // Mantém a ordem original para não conquistados
              return 0;

            case "earned-old":
              // Data da conquista (mais antiga primeiro)
              if (a.earned && b.earned) {
                return (
                  new Date(`${a.earnedDateTime}`).getTime() -
                  new Date(`${b.earnedDateTime}`).getTime()
                );
              }
              return 0;

            case "title-asc":
              return a.trophyName.localeCompare(b.trophyName);

            case "title-desc":
              return b.trophyName.localeCompare(a.trophyName);

            default:
              return 0;
          }
        });

        return { ...group, trophies: filteredTrophies };
      })
      .filter((group: TrophyGroup) => {
        // Remover grupos vazios (exceto o default se tiver DLCs ocultas)
        if (group.trophyGroupId === "default") return true;
        return group.trophies.length > 0 || showDLCs;
      });

      const dataTrophy = returnData.flatMap(group => group.trophies);
      setTotalEarned(dataTrophy.filter(trophy => trophy.earned).length);
      setTotalDefined(dataTrophy.length);

      return returnData;
  }, [game, filters, sortBy, searchTerm, showDLCs]);

  const tophyGradient = (type: string) => {
    const colors = {
      bronze: "-bg-linear-45 from-amber-700/10 via-20% to-transparent",
      silver: "-bg-linear-60 from-gray-400/20 via-20% to-transparent",
      gold: "-bg-linear-45 from-amber-400/10 via-20% to-transparent",
      platinum: "-bg-linear-45 from-blue-500/10 via-20% to-transparent",
    };
    return colors[type as keyof typeof colors] || "bg-linear-to-180 from-gray-400/50 to-white/5";
  };


  if (isLoading) {
    return (
      <LoadingSpinner
        title={`Detalhes do jogo`}
        subtitle="Carregando..."
      />
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Erro ao carregar jogo</h1>
          <p className="text-gray-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const coverImage =
    game?.concept?.media.images.find((a) => a.type === "MASTER")
        ?.url ||  
    game?.concept?.media.images.find((a) => a.type === "PORTRAIT_BANNER")
        ?.url ||
    game?.concept?.media.images[1]?.url ||
    game?.trophyTitle.trophyTitleIconUrl ||
    "/default-game-cover.webp";

  const platformText = game?.trophyTitle.trophyTitlePlatform || game?.platform || '';
  const platform = getPlatform(game!)
  
  const title =
    game?.localizedName || "Capa do jogo";
  const classPS3 =
    platformText === "PS3"
      ? "object-cover-custom p-3 bg-linear-to-bl from-black to-gray-500 border border-gray-950"
      : "object-cover";

  return (
    <>
      <div className="z-10 pl-3 lg:pl-6 pr-3 border-none pb-15">
        {/* Informações do Jogo */}
        <div className="flex items-center text-sm gap-0 lg:gap-4 sm:gap-2 inset-0 mt-3 lg:mt-5 lg:mb-15">
          <div className="relative hidden">
            <Image
              src={coverImage}
              alt={title}
              width={100}
              height={100}
              className={`w-32 h-32 lg:w-32 ${classPS3} aspect-square rounded-2xl`}
            />
          </div>

          <div className="text-lg lg:text-3xl font-semibold text-white text-left items-center flex-1 rounded-3xl h-30 lg:h-25">
            <div className="flex w-full items-center justify-between">
              <div className="flex gap-2">
                <h2 className="text-3xl lg:text-6xl font-semibold text-white">{title.replace('™', '')}</h2>
                <span className={`flex min-w-10 max-w-100 h-4.5 border ${platformText.includes("PS5") ? 'bg-white border-black text-black' : 'bg-black/80 border-white/50 text-white'} rounded-lg px-2 text-center`}>
                  {platform}
                </span>
                {game?.trophyTitle.gotyData && (
                  <span
                    className={`flex items-center gap-1 justify-between px-2 h-4.5 py-0.5 rounded-md bg-yellow-500 text-black -skew-x-10 text-xs`}
                  >
                    <FaAward /> <span>GOTY - {game?.trophyTitle.gotyData?.ano_premiacao}</span> 
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm lg:text-lg text-gray-300 font-thin lg:font-semibold flex gap-3 mt-4 italic drop-shadow-2xs shadow-black text-shadow-2xs">
              <p>🎮 {showDLCs ? game?.trophyTitle.progress?.toFixed(1) : ((totalEarned/totalDefined) * 100).toFixed(1)}%</p>
              <p>🏆 {totalEarned || 0}/{totalDefined}</p>
              { (game?.trophyGroups.length || 0) > 1 && (
                <p>📚 {(game?.trophyGroups.length || 0) - 1}
                  <button className={`${showDLCs ? 'bg-red-600/30' : 'bg-blue-500/30'} ml-4 h-6 px-2 py-1 -mt-6`} onClick={() => setShowDLCs(!showDLCs)}>
                    <span className={`text-xs flex items-center justify-between gap-2`}>{showDLCs ? <FaEyeSlash /> : <FaEye />} <span>DLCs</span></span>
                  </button>
                </p>)}
            </div>
          </div>
        </div>

        {/* Componente de Filtros */}
        <TrophyFilters
          trophyGroups={game?.trophyGroups}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showDLCs={showDLCs}
          onToggleDLCs={setShowDLCs}
          filteredItemsCount={filteredTrophyGroups.flatMap((g) => g.trophies).length}
        />

        {/* Lista de Troféus por Grupo */}
        <div className="space-y-6 pb-10">
          {filteredTrophyGroups
            .filter((group: TrophyGroup) => group.trophies.length > 0)
            .map((group: TrophyGroup) => (
              <div key={group.trophyGroupId}>
                <div className="flex items-center h-12 lg:h-18 justify-between text-sm gap-6 p-0 mb-6 bg-black/60 border border-white/20 rounded-lg" 
                // style={{backgroundImage: `url(${group.trophyGroupIconUrl})`, backgroundAttachment: 'fixed', backgroundSize: 'cover', 
                //           backgroundPosition: 'topcenter', backgroundBlendMode: 'overlay', backgroundRepeat: 'no-repeat',
                //           backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'opacity(0.6) blur(8px)'
                //           }}
                >
                          
                  <div className="flex items-center" >
                    <Image
                      src={group.trophyGroupIconUrl}
                      alt={group.trophyGroupName}
                      width={100}
                      height={100}
                      className={`h-15 w-20 lg:max-w-30 bg-left p-1 object-cover-custom lg:h-18  ${classPS3} hidden lg:block`}
                    />
                    <h3 className="text-md lg:text-2xl px-2 font-semibold text-white text-left">
                      {group.trophyGroupId === "default" ? "Jogo Base" : group.trophyGroupName}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center gap-5 text-gray-400">
                    <div className="hidden lg:block">
                      <TrophyMeter hideLevel={true} data={group} hidePlatinum={group.definedTrophies?.platinum === 0 ? true : false} 
                        hideTotal={false} showEarned={true} size="xl" space="15"/>
                    </div>
                    <div className="block lg:hidden">
                      <TrophyMeter hideLevel={true} data={group} hidePlatinum={true} 
                        hideTotal={true} showEarned={false} size="xs" space="15"/>
                    </div>
                    <div className="border-l border-white/20 h-10 w-15 lg:w-20 p-1 lg:p-0 lg:-pt-3">
                      <ProgressRing
                        progress={group.progress}
                        total={group.definedTrophies.bronze + group.definedTrophies.silver + group.definedTrophies.gold + group.definedTrophies?.platinum}
                        earned={group.earnedTrophies}
                        onlyText={true}
                        hideValue={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4">
                  {group.trophies.map((trophy: TrophyDetail) => (
                    <div
                      key={trophy.trophyId}
                      // style={{ backgroundImage: `url('/bg-stripes.png')`, backgroundRepeat: 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                      className={`transition-all duration-300 rounded-lg
                      ${trophy.earned ? `${tophyGradient(trophy.trophyType)}` : "grayscale-20"} 
                    `}>
                      <div className={`flex gap-2 glass-apple`}>
                        <div className={`min-w-25 min-h-25 w-25 h-25 p-0 rounded-l-lg bg-transparent aspect-square`}>
                          
                          <div className="flex">
                            <Image
                              src={trophy.trophyIconUrl || "/default-trophy.webp"}
                              alt={trophy.trophyName}
                              loading="eager"
                              layout="responsive"
                              width={50}
                              height={50}
                              className={` w-25 h-25 p-1 items-center rounded-l-xl ${
                                trophy.earned ? "saturate-150" : "saturate-0 opacity-50"}
                              `}
                            />
                            <div className="absolute h-25 w-25 pl-18.5 pt-18.5">
                              { (trophy.trophyHidden && !trophy.earned) && (<FaLock className="right-0 bottom-0 w-4 h-4 text-red-500" />)}
                              { (trophy.trophyHidden && trophy.earned) && (<FaLockOpen className="right-0 bottom-0 w-4 h-4 text-green-500" />)}  
                            </div>
                          </div>

                          

                          <div 
                            className={trophy.progressRate > 0 ? `absolute rounded-l-sm top-0 
                              ${'w-'+((trophy.progressRate / 100) * 25).toFixed(0)} mb-0 h-25 border-r-4 border-green-500/60` : 'hidden' } >
                            <span className="relative p-2 text-lg font-bold text-white drop-shadow-2xs shadow-black text-shadow-2xs">{trophy.progressRate}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between flex-col min-h-25 w-full h-full py-2 lg:px-2 ">
                          <h3
                            className={`font-semibold w-full line-clamp-1 mb-2 text-sm lg:text-[16px] shadow-black text-shadow-xs ${trophy.earned ? "text-green-400" : "text-white/90" }`}
                          >
                            {trophy.trophyName}
                          </h3>

                          <p className="text-white/90 font-thin text-xs h-10 -mt-2 italic max-w-80 lg:max-w-screen w-full line-clamp-2">
                            {trophy.trophyDetail}
                          </p>
                          <p className="flex justify-between items-end">
                            {(trophy.earnedDateTime && (
                              <span
                                className="text-green-400 text-xs -mt-3"
                                title="Data de conquista"
                              >
                                <FaCalendar className="inline mr-1 -mt-1" />
                                {new Date(trophy.earnedDateTime).toLocaleDateString("pt-BR")} - {new Date(trophy.earnedDateTime).toTimeString().slice(0, 5)}h 
                              </span>
                            ))} 
                            {!trophy.earnedDateTime && (
                              <span className="text-green-400 text-xs -mt-3"></span>
                            )}
                            {(trophy.progressRate && (
                              <span
                                className="text-gray-400 text-xs text-left"
                                title="progresso da conquista"
                              >
                                <FaAdjust className="inline mr-1 -mt-1" />{trophy.progress} / {trophy.trophyProgressTargetValue}
                              </span>
                            )) || <span className="text-gray-400 text-xs"></span>}
                          </p>
                        </div>

                        <div className={`flex flex-col justify-between items-right h-25 p-2 w-12`}>
                          
                            <Image
                              src={`/${trophy.trophyType}.png`}
                              alt={trophy.trophyType}
                              loading="eager"
                              layout="fixed"
                              width={100}
                              height={100}
                              className={`w-6`}
                            />
                          
                          <div
                            className="text-white-300/20 items-center text-xs text-right shadow-black text-shadow-xs"
                            title="% de jogadores que conquistaram"
                          >
                            {Number(trophy.trophyEarnedRate).toFixed(1)}％
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Mensagem quando não há troféus após filtro */}
        {filteredTrophyGroups.filter((g: TrophyGroup) => g.trophies.length > 0)
          .length === 0 && (
          <div className="text-center py-16 glass-apple-dark mr-3">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl text-white mb-2">
              Nenhum troféu encontrado
            </h2>
            <p className="text-gray-400 mb-4">
              {searchTerm
                ? `Nenhum troféu encontrado para "${searchTerm}"`
                : "Tente alterar os filtros para ver mais troféus"}
            </p>
            <button
              onClick={() => {
                setFilters({ type: [], status: [] });
                setSearchTerm("");
              }}
              className="px-4 py-2 bg-linear-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-lg text-white transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function GameDetailPage() {
  return (
    <Suspense
      fallback={
        <LoadingSpinner title="Biblioteca de Jogos" subtitle="Carregando ..." />
      }
    >
      <GameDetailPageContent />
    </Suspense>
  );
}
