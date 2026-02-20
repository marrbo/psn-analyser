// app/components/TrophyFilters.tsx
"use client";

import { FiFilter, FiSearch, FiCheck } from "react-icons/fi";
import {
  FaSortAlphaDown,
  FaSortAlphaDownAlt,
  FaSortAmountDown,
  FaSortAmountDownAlt,
  FaTrashAlt
} from "react-icons/fa";
import { useMemo, useState } from "react";
import { TrophyGroup } from "@/types/trophies";
import { TbTrophy, TbTrophyFilled, TbTrophyOff } from "react-icons/tb";

interface TrophyFiltersProps {
  readonly trophyGroups: TrophyGroup[] | undefined;
  readonly filters: TrophyFiltersState;
  readonly onFilterChange: (
    key: keyof TrophyFiltersState,
    value: string,
  ) => void;
  readonly sortBy: string;
  readonly onSortChange: (value: string) => void;
  readonly searchTerm: string;
  readonly onSearchChange: (value: string) => void;
  readonly showDLCs: boolean;
  readonly onToggleDLCs: (value: boolean) => void;
}

export interface TrophyFiltersState {
  type: string[]; // bronze, silver, gold, platinum, all
  status: string[]; // earned, not-earned, all
}

export default function TrophyFilters({
  trophyGroups,
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  searchTerm,
  onSearchChange
}: TrophyFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Contar troféus por tipo
  const trophyStats = useMemo(() => {
    const stats = {
      all: { total: 0, earned: 0 },
      bronze: { total: 0, earned: 0 },
      silver: { total: 0, earned: 0 },
      gold: { total: 0, earned: 0 },
      platinum: { total: 0, earned: 0 },
    };

    for (const group of trophyGroups || []) {
      for (const trophy of group.trophies || []) {
        const type = trophy.trophyType.toLowerCase();
        if (stats[type as keyof typeof stats]) {
          stats[type as keyof typeof stats].total++;
          stats.all.total++;
          if (trophy.earned) {
            stats[type as keyof typeof stats].earned++;
            stats.all.earned++;
          }
        }
      }
    }

    return stats;
  }, [trophyGroups]);

  // Função para tratar seleção de filtros
  const handleFilterSelect = (key: keyof TrophyFiltersState, value: string) => {
    if (value === "all") {
      // Se clicar em "Todos", limpa todos os filtros desse tipo
      onFilterChange(key, "all");
    } else {
      // Se clicar em um item específico
      if (key === "type") {
        // Para tipos: remove "all" se estiver selecionado
        const currentFilters = filters.type.includes("all")
          ? [value]
          : filters.type.includes(value)
            ? filters.type.filter((item) => item !== value)
            : [...filters.type, value];

        // Atualiza os filtros
        onFilterChange(key, "reset"); // Primeiro reseta
        currentFilters.forEach((item) => onFilterChange(key, item));
      } else if (key === "status") {
        // Para status: comportamento de radio button entre "earned" e "not-earned"
        // Se clicar no mesmo, desmarca
        const isCurrentlySelected = filters.status.includes(value);
        if (isCurrentlySelected) {
          onFilterChange(key, "all"); // Desmarca, volta para "Todos"
        } else {
          onFilterChange(key, "reset"); // Primeiro reseta
          onFilterChange(key, value); // Seleciona o novo
        }
      }
    }
  };

  // Opções de tipo de troféu
  const trophyTypeOptions = [
    {
      value: "all",
      label: "Todos",
      color: "text-white",
      bgColor: "bg-gray-600/20",
    },
    {
      value: "bronze",
      label: "Bronze",
      color: "text-yellow-700",
      bgColor: "bg-yellow-700/20",
    },
    {
      value: "silver",
      label: "Prata",
      color: "text-gray-300",
      bgColor: "bg-gray-300/20",
    },
    {
      value: "gold",
      label: "Ouro",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/20",
    },
    {
      value: "platinum",
      label: "Platina",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/20",
    },
  ];

  // Opções de status
  const statusOptions = [
    {
      value: "all",
      label: "Todos",
      icon: "",
      color: "text-white",
      bgColor: "bg-gray-600/20",
    },
    {
      value: "earned",
      label: "Conquistados",
      icon: "",
      color: "text-green-400",
      bgColor: "bg-green-600/20",
    },
    {
      value: "not-earned",
      label: "Não Conquistados",
      icon: "",
      color: "text-red-400",
      bgColor: "bg-red-600/20",
    },
    {
      value: "progress",
      label: "Em progresso",
      icon: "",
      color: "text-blue-400",
      bgColor: "bg-blue-600/20",
    },
  ];

  // Opções de ordenação
  const sortOptions = [
    { value: "recent", label: "Mais Recentes", icon: <FaSortAmountDown /> },
    { value: "title-asc", label: "Título (A-Z)", icon: <FaSortAlphaDown /> },
    {
      value: "title-desc",
      label: "Título (Z-A)",
      icon: <FaSortAlphaDownAlt />,
    },
    {
      value: "earned-recent",
      label: "Conquista (Recente)",
      icon: <FaSortAmountDown />,
    },
    {
      value: "earned-old",
      label: "Conquista (Antiga)",
      icon: <FaSortAmountDownAlt />,
    },
  ];

  // Verificar se "Todos" está selecionado para cada filtro
  const isAllTypesSelected =
    filters.type.length === 0 || filters.type.includes("all");
  const isAllStatusSelected =
    filters.status.length === 0 || filters.status.includes("all");

  return (
    <div className="mb-6 p-0">
      {/* Header dos Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-linear-to-r from-purple-600/20 to-purple-800/20 hover:from-purple-600/30 hover:to-purple-800/30"
          >
            <FiFilter className="text-purple-400" />
            <span className="text-white">Filtros</span>
            {(!isAllTypesSelected || !isAllStatusSelected || searchTerm) && (
              <span className="bg-blue-500 text-xs px-2 py-0.5 rounded-full">
                Ativo
              </span>
            )}
          </button> */}

          {/* Ordenação */}
          <div className="relative flex gap-2 mb-2 items-center justify-between w-full lg:w-auto rounded-lg">
            {/* <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-4 py-2 border w-10 lg:w-50 rounded-lg appearance-none pr-10 cursor-pointer hover:bg-gray-750 transition-colors"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select> */}

            <div className="join h-15">
              <button
                className="join-item bg-gray-600/60 p-5"
                onClick={() =>
                  onSortChange(
                    sortBy === "title-asc"
                      ? "title-desc"
                      : sortBy === "title-desc"
                        ? "title-asc"
                        : "title-asc",
                  )
                }
              >
                {sortBy !== "title-desc" && <FaSortAlphaDown />}
                {sortBy === "title-desc" && <FaSortAlphaDownAlt />}
              </button>

              <button
                className="join-item bg-gray-600/60 p-5"
                onClick={() =>
                  onSortChange(
                    sortBy === "title-asc"
                      ? "title-desc"
                      : sortBy === "title-desc"
                        ? "title-asc"
                        : "title-asc",
                  )
                }
              >
                {sortBy !== "title-desc" && <FaSortAlphaDown />}
                {sortBy === "title-desc" && <FaSortAlphaDownAlt />}
              </button>
            </div>

            <div className="join h-15">
              <button
                className={`join-item  p-5 ${filters.status.includes("earned") ? "bg-blue-800/60" : "bg-gray-600/60"}`}
                onClick={() => handleFilterSelect("status", "earned")}
              >
                <TbTrophy />
              </button>
              <button
                className={`join-item p-5  bg-gray-600/60 ${filters.status.includes("progress") ? "bg-blue-800/60" : "bg-gray-600/60"}`}
                onClick={() => handleFilterSelect("status", "progress")}
              >
                <TbTrophyFilled />
              </button>
              <button
                className={`join-item bg-gray-600/60 p-5 ${filters.status.includes("not-earned") ? "bg-blue-800/60" : "bg-gray-600/60"}`}
                onClick={() => handleFilterSelect("status", "not-earned")}
              >
                <TbTrophyOff />
              </button>
            </div>

            {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <FaSort className="text-gray-400" />
            </div> */}

            <button
              onClick={() => {
                onFilterChange("type", "all");
                onFilterChange("status", "all");
                onSearchChange("");
              }}
              className="bg-red-700/30 pt-5 h-15 w-15 hover:bg-red-800 text-sm text-gray-300 transition-colors mr-0 lg:mr-6 flex justify-center"
            >
              <FaTrashAlt className="h-4 w-4" />
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar troféu..."
                className="pl-10 -mt-2 h-15 text-white w-[calc(100vw-2rem)] lg:w-80 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
              <FiSearch className="absolute left-3 -mt-9 text-gray-400" />
              {searchTerm && (
                <span
                  onClick={() => onSearchChange("")}
                  className="text-white absolute right-5 -mt-1 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-gray-300"
                >
                  ×
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Expandidos */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-3 bg-gray-900/50 rounded-lg mb-4">
          {/* Filtro por Tipo de Troféu */}
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Tipo
              de Troféu
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {trophyTypeOptions.map((type) => {
                const isSelected =
                  type.value === "all"
                    ? isAllTypesSelected
                    : filters.type.includes(type.value);

                return (
                  <button
                    key={type.value}
                    onClick={() => handleFilterSelect("type", type.value)}
                    className={`px-2 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? `${type.bgColor} border ${type.color.replace("text", "border")}/50`
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {type.value !== "all" && (
                        <div
                          className={`w-3 h-3 rounded-full ${type.color.replace("text", "bg")}`}
                        ></div>
                      )}
                      <span
                        className={isSelected ? type.color : "text-gray-300"}
                      >
                        {type.label}
                      </span>
                    </div>
                    {isSelected && type.value !== "all" && (
                      <FiCheck className="text-xs" />
                    )}
                    {type.value !== "all" && (
                      <span className="text-gray-400 text-xs ml-2">
                        {trophyStats[type.value as keyof typeof trophyStats]
                          ?.earned || 0}
                        /
                        {trophyStats[type.value as keyof typeof trophyStats]
                          ?.total || 0}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro por Status */}
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Status
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {statusOptions.map((status) => {
                const isSelected =
                  status.value === "all"
                    ? isAllStatusSelected
                    : filters.status.includes(status.value);

                return (
                  <button
                    key={status.value}
                    onClick={() => handleFilterSelect("status", status.value)}
                    className={`px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? `${status.bgColor} border ${status.color.replace("text", "border")}/50`
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-lg">{status.icon}</span>
                    <span>{status.label}</span>
                    {isSelected && <FiCheck className="text-xs" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tags de Filtros Ativos */}
      {(!isAllTypesSelected || !isAllStatusSelected || searchTerm) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Tags para Tipo */}
          {!isAllTypesSelected && filters.type.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.type.map((type) => {
                const typeInfo = trophyTypeOptions.find(
                  (t) => t.value === type,
                );
                return (
                  <div
                    key={type}
                    className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full"
                  >
                    <span
                      className={`text-xs ${typeInfo?.color || "text-yellow-300"}`}
                    >
                      {typeInfo?.label || type}
                    </span>
                    <span
                      onClick={() => handleFilterSelect("type", type)}
                      className={`${typeInfo?.color || "text-yellow-400"} hover:opacity-80`}
                    >
                      ×
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tags para Status */}
          {!isAllStatusSelected && filters.status.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.status.map((status) => {
                const statusInfo = statusOptions.find(
                  (s) => s.value === status,
                );
                return (
                  <div
                    key={status}
                    className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full"
                  >
                    <span
                      className={`text-xs ${statusInfo?.color || "text-green-300"}`}
                    >
                      {statusInfo?.label || status}
                    </span>
                    <span
                      onClick={() => handleFilterSelect("status", status)}
                      className={`${statusInfo?.color || "text-green-400"} hover:opacity-80`}
                    >
                      ×
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tag para Busca */}
          {searchTerm && (
            <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full">
              <span className="text-purple-300 text-sm">
                Busca: &quot;{searchTerm}&quot;
              </span>
              <span
                onClick={() => onSearchChange("")}
                className="text-purple-400 hover:text-purple-300"
              >
                ×
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
