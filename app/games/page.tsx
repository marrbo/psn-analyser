// app/games/page.tsx
"use client";

import { useEffect, useState, Suspense, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import TrophyMeter from "../components/ui/TrophyMeter";
import Image from "next/image";
import { GameTitle } from "@/types/trophies";
import { getPlatform, useHeader } from "@/providers/HeaderContext";
import DurationDisplay from "../components/ui/DurationDisplay";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import GameFilters, { FiltersState } from "../components/ui/GameFilters";
import PaginationWithIcons from "../components/ui/PaginationWithIcons";
import { FaAward, FaClock, FaGamepad } from "react-icons/fa";
import { SiMetacritic } from "react-icons/si";

function GamesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allGames, setAllGames] = useState<GameTitle[]>([]);
  const [displayedGames, setDisplayedGames] = useState<GameTitle[]>([]); // Jogos exibidos
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Para o "Mostrar mais"
  const [accountId, setAccountId] = useState("");
  const {
    setTexto,
    setShow,
    setTitle,
    setPsnUser,
    setTrophyData,
    setOnClick,
    setFocusGame,
    isMobile,
    setAnalysisData,
  } = useHeader();

  const setGameInFocus = useCallback(
    (game: GameTitle) => {
      setFocusGame(game);
    },
    [setFocusGame],
  );

  // Estados para filtros, ordenação e busca
  const [filters, setFilters] = useState<FiltersState>({
    platform: [],
    status: [],
  });

  const [sortBy, setSortBy] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para acumular itens no mobile
  const [loadedPages, setLoadedPages] = useState<number[]>([1]);

  useEffect(() => {
    const analysisId = searchParams.get("analysisId");
    const accId = searchParams.get("accountId");

    if (!analysisId || !accId) {
      router.push("/");
      return;
    }

    const fetchGames = async (analysisId: string) => {
      try {
        const response = await fetch(`/api/analyses/${analysisId}`);

        if (!response.ok) {
          throw new Error("Erro ao carregar análise");
        }

        const _analysisData = await response.json();
        setTitle("PlayGrid 🎮 Biblioteca de Jogos");
        setOnClick(() => router.push("/dashboard"));
        setAnalysisData(_analysisData);
        const gamesData = _analysisData.games || [];
        setAllGames(gamesData);
        setDisplayedGames(gamesData); // Inicialmente mostra todos os jogos
        setTotalPages(1); // No início temos apenas uma página com todos os jogos
        setShow(true);
        setTexto("Voltar ao Dashboard");
        setTrophyData(_analysisData?.trophySummary);
        setPsnUser(_analysisData?.psnUser);
        setFocusGame(gamesData[0]);
      } catch (error) {
        console.error("Erro ao carregar jogos:", error);
      } finally {
        setIsLoading(false);

        const scrollToTop = () => {
          // Alternativa 2: Para um elemento específico
          const element = document.getElementById("layout");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        };

        scrollToTop();
      }
    };

    setAccountId(accId);
    fetchGames(analysisId);
  }, [
    searchParams,
    router,
    setAccountId,
    setTitle,
    setOnClick,
    setShow,
    setTexto,
    setTrophyData,
    setPsnUser,
    setFocusGame,
    setAnalysisData,
  ]);

  // Função para carregar mais itens (modo mobile)
  const handleLoadMore = async () => {
    if (currentPage >= totalPages) return;

    setIsLoadingMore(true);
    try {
      // Simula carregamento da próxima página
      // Em uma implementação real, você faria uma chamada à API
      const nextPage = currentPage + 1;
      const itemsPerPage = 12;

      // Se não for a primeira página, acumula os itens
      if (nextPage > 1 && !loadedPages.includes(nextPage)) {
        // Aqui você faria a chamada à API para obter os jogos da próxima página
        // Por enquanto, simulamos pegando mais jogos do array existente
        
        const startIndex = (nextPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const nextGames = filteredGames.slice(startIndex, endIndex);

        // Acumula os jogos
        setDisplayedGames((prev) => [...prev, ...nextGames]);
        setLoadedPages((prev) => [...prev, nextPage]);
        setCurrentPage(nextPage);
      }

      // Se não houver mais páginas, atualiza o total
      if (nextPage >= Math.ceil(filteredGames.length / itemsPerPage)) {
        setTotalPages(nextPage);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Função para mudar de página (modo desktop)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Em uma implementação real, você faria:
    // fetchGamesForPage(page);

    // Por enquanto, simulamos com os dados existentes
    const itemsPerPage = 12;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageGames = (
      filteredGames.length > 0 ? filteredGames : allGames
    ).slice(startIndex, endIndex);

    setDisplayedGames(pageGames);
  };

  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    setFilters((prev) => {
      const currentArray = prev[key];

      // Se for "all", limpa o array
      if (value === "all") {
        return {
          ...prev,
          [key]: [],
        };
      }

      // Para o campo 'status', lógica especial
      if (key === "status") {
        // Definir grupos mutuamente exclusivos
        const progressGroup = ["100percent", "in-progress"];

        // Se já existe, remove (toggle off)
        if (currentArray.includes(value)) {
          return {
            ...prev,
            [key]: currentArray.filter((item) => item !== value),
          };
        }

        // Se não existe, adiciona com regras
        let newArray = [...currentArray];

        // Se for 'not-started' -> remove tudo e adiciona apenas 'not-started'
        if (value === "not-started") {
          return {
            ...prev,
            [key]: ["not-started"],
          };
        }

        // Se for 'platinum' -> remove 'not-started' e adiciona 'platinum'
        if (value === "platinum") {
          newArray = newArray.filter((item) => item !== "not-started");
          newArray.push(value);
          return {
            ...prev,
            [key]: newArray,
          };
        }

        // Se for '100percent' ou 'in-progress'
        if (progressGroup.includes(value)) {
          // Remove outros do progressGroup
          newArray = newArray.filter((item) => !progressGroup.includes(item));
          // Remove 'not-started'
          newArray = newArray.filter((item) => item !== "not-started");
          // Adiciona o novo valor
          newArray.push(value);
          return {
            ...prev,
            [key]: newArray,
          };
        }
      }

      // Para 'platform', toggle normal
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [key]: currentArray.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [key]: [...currentArray, value],
        };
      }

      return prev;
    });

  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const gameGetService = (service: string) => {
    switch (service) {
      case "ps_plus": 
        return <Image src="/ps-plus.png" alt="PS Plus" width={16} height={16} className="inline-block" />;
      case "none(purchased)":
        return '';
      default:
        return ''
    };
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Jogos filtrados e ordenados (useMemo para performance)
  const filteredGames = useMemo(() => {
    let filtered = [...allGames];

    // Aplicar filtro de plataforma (múltiplas seleções)
    if (filters.platform.length > 0) {
      filtered = filtered.filter((game) =>
        filters.platform.includes(game?.trophyTitle.trophyTitlePlatform),
      );
    }

    // Aplicar filtro de status (múltiplas seleções - lógica AND)
    if (filters.status.length > 0) {
      filtered = filtered.filter((game) => {
        // Verifica se o jogo atende a TODOS os status selecionados
        return filters.status.every((status) => {
          switch (status) {
            case "platinum":
              return (game?.trophyTitle.earnedTrophies?.platinum || game?.earnedTrophies?.platinum) > 0;
            case "100percent":
              return game.trophyTitle.progress === 100;
            case "in-progress":
              return game.trophyTitle.progress > 0 && game.trophyTitle.progress < 100;
            case "not-started":
              return (game.trophyTitle.progress || 0) === 0;
            case "goty":
              return game.trophyTitle.gotyData || game.trophyTitle.isGoty;
            default:
              return true;
          }
        });
      });
    }

    // Aplicar busca por nome
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((game) =>
        (game.localizedName)
          .toLowerCase()
          .includes(term),
      );
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(
              b?.lastPlayedDateTime || b?.lastUpdatedDateTime,
            ).getTime() -
            new Date(
              a?.lastPlayedDateTime || a?.lastUpdatedDateTime,
            ).getTime()
          );
        case "progress-desc":
          return b.trophyTitle.progress - a.trophyTitle.progress;
        case "progress-asc":
          return a.trophyTitle.progress - b.trophyTitle.progress;
        case "title-asc":
          return a.localizedName.localeCompare(b.localizedName);
        case "title-desc":
          return b.localizedName.localeCompare(a.localizedName);
        case "old":
          return (
            new Date(
              a?.lastPlayedDateTime || a?.lastUpdatedDateTime,
            ).getTime() -
            new Date(
              b?.lastPlayedDateTime || b?.lastUpdatedDateTime,
            ).getTime()
          );
        default:
          return (
            new Date(
              b?.lastPlayedDateTime || b?.lastUpdatedDateTime,
            ).getTime() -
            new Date(
              a?.lastPlayedDateTime || a?.lastUpdatedDateTime,
            ).getTime()
          );
      }
    });

    return filtered;
  }, [filters, sortBy, searchTerm, allGames]);

  // Atualizar displayedGames quando filtros mudam
  useEffect(() => {
    // Quando filtros/busca mudam, resetamos a paginação
    setCurrentPage(1);
    setLoadedPages([1]);

    // Mostra os primeiros itens da lista filtrada
    const itemsPerPage = 12;
    const initialGames = filteredGames.slice(0, itemsPerPage);
    setDisplayedGames(initialGames);

    // Calcula o total de páginas
    const newTotalPages = Math.ceil(filteredGames.length / itemsPerPage);
    setTotalPages(newTotalPages || 1);
  }, [filteredGames]);

  if (isLoading) {
    return (
      <LoadingSpinner
        title="Meus Jogos"
        subtitle="Carregando lista de jogos..."
      />
    );
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 pr-3 mb-30">
      {/* Header */}
      <div className="relative flex max-w-screen lg:items-start lg:justify-start pb-0">
        <h2 className="text-4xl pt-2 text-center w-full lg:pb-8 lg:text-6xl">
          Meus Jogos
          <span className="text-gray-400 text-lg"> ({filteredGames.length})</span>
        </h2>
      </div>

      <div className="relative flex w-full items-center max-w-screen justify-end gap-5 pb-0 mb-6">
        {/* Componente de Filtros */}
        <div>
          <GameFilters
            games={allGames}
            filters={filters}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        </div>

        <div className="hidden lg:block">
          {/* Componente de Paginação */}
          <PaginationWithIcons
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onLoadMore={handleLoadMore}
            hasMore={currentPage < totalPages}
            isLoading={isLoadingMore}
            itemsPerPage={12}
          />
        </div>
      </div>

      {/* Lista de Jogos Paginada */}
      <div className="gap-3 lg:gap-5 grid grid-cols-1 sm:grid-cols-1 pl-3 md:grid-cols-1 xl:grid-cols-2">
        {displayedGames.map((game) => {
          const bg = "bg-white/15";
          // game.progress === 100
          //   ? `bg-${color}/20 border-2 border-${color}/50 `
          //   : `bg-white/15`;
          const hover = `hover:border-white/80 hover:drop-shadow-3xl hover:shadow-blue-300/20 ease-in-out duration-500`;
          const playedTime = game.playDuration || "0";
          const platform = getPlatform(game);
          const platformText = game?.platform || game?.trophyTitle?.trophyTitlePlatform || 'PS5/';
          const title = game.localizedName || game.name;
          const PS3andServiceTrophy =
            "object-cover-custom bg-black border border-gray-950 object-center";

          const coverImage =
            game?.localizedImageUrl ||
            game?.concept?.media.images.find(
              (a) => a.type === "MASTER",
            )?.url ||
            game?.concept?.media.images.find(
              (a) => a.type === "PORTRAIT_BANNER",
            )?.url ||
            game?.concept?.media.images[1]?.url ||
            game?.trophyTitle.trophyTitleIconUrl ||
            "/default-game-cover.webp";

          return (
            <Link
              key={game.titleId}
              onMouseEnter={() => setGameInFocus(game)}
              href={`/games/${game.trophyTitle.npCommunicationId}?accountId=${accountId}`}
              className={`group glass-apple-dark h-25.5 lg:h-34.5 p-1 lg:p-2 mask-intersect
                bg-blend-difference flex justify-between gap-2 ${hover} transition-all duration-300 transform cursor-pointer`}
            >
              {/* <div
                className={
                  game?.trophyTitle?.progress > 0
                    ? `absolute h-25.5 bg-blend-multiply border-none mask-intersect
                  ${game?.trophyTitle?.progress === 100 ? "bg-green-500/20" : ""} h-full w-full`
                    : "hidden"
                }
              >
                {game?.trophyTitle?.progress < 100 && game?.trophyTitle?.progress > 0 && (
                  <div
                    style={{ height: game.trophyTitle.progress + "%" }}
                    className={`w-screen absolute -left-4 -right-4 bottom-0 bg-green-400/30 block lg:hidden group-hover:block border-t-10 border-green-400/5`}
                  ></div>
                )}
              </div> */}

              {/* Capa do Jogo */}
              <div className="relative group border-none bg-none">
                <Image
                  src={coverImage}
                  alt={title}
                  width={200}
                  height={200}
                  className={`shrink-0 h-22.5 lg:h-28 m-1 max-w-23 lg:max-w-28 aspect-square ${
                    platformText === "PS3" || game.npServiceName === "trophy"
                      ? PS3andServiceTrophy
                      : "object-cover"
                  } rounded-lg saturate-50 group-hover:scale-105 group-hover:saturate-110 hover:rounded-md group-hover:border-none transform ease-in-out duration-600`}
                />

                <div className={`absolute right-1.5 top-1.5 w-4.5 h-4.5 -mt-1 ${game.service === 'ps_plus' ? '' : 'hidden'}`}>{gameGetService(game.service)}</div>

                <span
                  className={`absolute left-1/2 transform -translate-x-1/2 bottom-2 flex justify-between gap-2`}
                >
                  <span
                    className={`${platformText.includes("PS5") ? "bg-white border-black text-black" : "bg-black border-white/40 text-white"} border rounded-md px-1.5 text-xs h-4.5 m-0 p-0 text-center`}
                  >
                    {platform}
                  </span>
                  {game?.trophyTitle?.gotyData && (
                    <span
                      className={`flex w-auto items-center gap-1 justify-between px-2 h-4.5 py-0.5 rounded-md bg-yellow-500 text-black text-xs`}
                    >
                      <FaAward /> <span>{game?.trophyTitle.gotyData?.ano_premiacao}</span>
                    </span>
                  )}
                </span>
                
              </div>

              <div className="w-full grid grid-rows-2 pt-1">
                {/* Título do Jogo */}
                <div
                  className={`font-pixel ${game?.trophyTitle?.progress === 100 || game?.earnedTrophies?.platinum > 0 ? "text-green-500" : "text-gray-400"} group-hover:text-white flex items-top justify-between text-sm font-semibold lg:text-lg text-left line-clamp-2 lg:truncate drop-shadow-xs text-shadow-black text-shadow-2xs`}
                >
                  <span>{title.replace('™', '')}</span>
                </div>

                {/* Troféus */}
                <div className="saturate-20 group-focus:saturate-100 group-hover:saturate-100 w-full -ml-2 -mt-3 lg:-mt-1 space-y-2.5">
                  <TrophyMeter
                    data={game.trophyTitle}
                    hideTotal={isMobile}
                    hidePlatinum={game?.trophyTitle?.definedTrophies?.platinum === 0}
                    showEarned={!isMobile}
                    hideLevel={true}
                    size="sm"
                  />

                  {/* Informações do Jogo */}
                  <ul className="list rounded-md text-gray-300/70 ml-2 gap-0 p-0 text-xs">
                    <li className="list-row p-0 mb-0 mt-2">
                      { (game?.trophyTitle?.metacritc?.metascore ?? 0) > 0 && (
                        <div className="flex flex-row justify-end gap-2 items-center">
                          <SiMetacritic className="w-4.5 h-4.5" />
                          <div>{game?.trophyTitle?.metacritc?.metascore ?? "tbd"} / 100</div>
                        </div>
                      )}
                      { (game?.trophyTitle?.metacritc?.metascore ?? 0) === 0 && (
                      <div className="flex flex-row justify-end gap-2 items-center">
                      </div>)}

                      {playedTime !== "0" && (
                        <>
                          <div className="flex flex-row justify-end gap-1 items-center">
                            <FaClock className="w-4" />
                            <span>
                              <DurationDisplay
                                isoDuration={playedTime}
                                format="hhmmss"
                              />
                            </span>
                          </div>
                          <div className="flex flex-row justify-end gap-2 items-center">
                            <FaGamepad className="w-4" />
                            <span>{game.playCount || 0}</span>{" "}
                          </div>
                        </>
                      )}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col p-2 pt-1 items-end justify-between w-10">
                {/* Progresso */}
                <div className="aspect-square text-gray-300 text-right font-bold text-shadow-black lg:text-white/60 italic text-sm lg:text-lg">
                  {game?.trophyTitle?.progress}
                  <span className="text-[7pt] lg:text-xs inline-block align-middle">%</span>
                </div>
                <Image
                  src="/platinum.png"
                  alt="Platinum Trophy"
                  width={200}
                  height={200}
                  className={`w-8 lg:w-12 ${
                    game?.trophyTitle?.definedTrophies?.platinum < 1 ? "hidden" : ""
                  } ${
                    game?.trophyTitle?.earnedTrophies?.platinum > 0 || 0
                      ? " group-hover:scale-115 group-hover:animate-pulse transition-all duration-300 ease-in-out cursor-pointer "
                      : " grayscale opacity-20"
                  }`}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Componente de Paginação (duplicado no final) */}
      {filteredGames.length > 0 && (
        <div className="mt-8 mb-16">
          <PaginationWithIcons
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onLoadMore={handleLoadMore}
            hasMore={currentPage < totalPages}
            isLoading={isLoadingMore}
          />
        </div>
      )}

      {filteredGames.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="mb-2">Nenhum jogo encontrado</h3>
          <p className="text-gray-400">
            {allGames.length > 0
              ? searchTerm
                ? `Nenhum jogo encontrado para "${searchTerm}"`
                : "Tente alterar os filtros para ver mais jogos"
              : "Faça uma análise do seu perfil PSN primeiro"}
          </p>
          {searchTerm && allGames.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({ platform: [], status: [] });
                setCurrentPage(1);
                setLoadedPages([1]);
              }}
              className="mt-4 px-4 py-2 bg-linear-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 rounded-lg text-white transition-all"
            >
              Limpar Busca e Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen  flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl text-white">Carregando...</h2>
          </div>
        </div>
      }
    >
      <GamesPageContent />
    </Suspense>
  );
}
