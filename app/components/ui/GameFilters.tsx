import { TrophyTitle } from "@/types/trophies";
import { useMemo, useState, useEffect } from "react";
import { 
  FaSortAlphaDown, 
  FaSortAmountDown, 
  FaSortAmountDownAlt, 
  FaSortAlphaDownAlt, 
  FaSort, 
  FaRegTrashAlt,
  FaTimes,
  FaFilter,
  FaSearch
} from "react-icons/fa";
import { FiCheck } from "react-icons/fi";

export interface FiltersState {
  platform: string[];
  status: string[];
}

// Componente de Filtros
function GameFilters({
  games,
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  searchTerm,
  onSearchChange
}: {
  games: TrophyTitle[];
  filters: FiltersState;
  onFilterChange: (key: keyof FiltersState, value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Extrair plataformas únicas dos jogos
  const platforms = useMemo(() => {
    const uniquePlatforms = Array.from(
      new Set(games.map(game => game?.gameTitle?.platform || game?.trophyTitlePlatform))
    ).sort((a, b) => a.localeCompare(b));
    return uniquePlatforms;
  }, [games]);

  // Status de conclusão
  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'platinum', label: 'Platinados' },
    { value: '100percent', label: '100%' },
    { value: 'in-progress', label: 'Em Progresso' },
    { value: 'not-started', label: 'Não Iniciados' },
    { value: 'goty', label: 'GOTY' }
  ];

  // Opções de ordenação
  const sortOptions = [
    { value: 'recent', label: 'Recentes', icon: <FaSortAlphaDown /> },
    { value: 'progress-desc', label: 'Progresso (Maior)', icon: <FaSortAmountDown /> },
    { value: 'progress-asc', label: 'Progresso (Menor)', icon: <FaSortAmountDownAlt /> },
    { value: 'title-asc', label: 'Título (A-Z)', icon: <FaSortAlphaDown /> },
    { value: 'title-desc', label: 'Título (Z-A)', icon: <FaSortAlphaDownAlt /> },
    { value: 'old', label: 'Mais antigos', icon: <FaSortAlphaDownAlt /> }
  ];

  // Fechar modal com Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    onFilterChange('platform', 'all');
    onFilterChange('status', 'all');
    onSearchChange('');
    onSortChange('recent');
    setIsModalOpen(false)
  };

  // Contar filtros ativos
  const activeFiltersCount = 
    filters.platform.length + 
    filters.status.length + 
    (searchTerm ? 1 : 0);

  return (
    <div className="relative">
      {/* Botão Principal para Abrir Filtros */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-blue-900/70 p-3"
        >
          <FaFilter className="text-white"/>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 absolute -top-3 right-0 text-xs px-1 py-0.5 rounded-full min-w-5 h-5">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Botão Limpar Tudo (somente se houver filtros ativos) */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 hidden p-3 lg:block bg-red-900/70"
            title="Limpar todos os filtros"
          >
            <FaRegTrashAlt />
          </button>
        )}
      </div>

      {/* Modal de Filtros */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-2000 flex items-center justify-center p-4">
            <div 
              className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <FaFilter className="text-blue-400 w-6 h-6" />
                  <h3 className="text-2xl font-semibold text-white">Filtros e Ordenação</h3>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <span
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  <FaTimes className="text-gray-400 text-xl" />
                </span>
              </div>

              {/* Conteúdo do Modal */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Campo de Busca */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center gap-2">
                    <FaSearch />
                    Buscar por nome
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Digite o nome do jogo..."
                      className="w-full px-4 py-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {searchTerm && (
                      <span
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 cursor-pointertransform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <FaTimes />
                      </span>
                    )}
                  </div>
                </div>

                {/* Ordenação */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center gap-2">
                    <FaSort />
                    Ordenar por
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onSortChange(option.value)}
                        className={`flex items-center justify-center gap-2 rounded-lg transition-all ${
                          sortBy === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-sm">{option.icon}</span>
                        <span className="text-xs">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Plataforma */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Plataforma
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onFilterChange('platform', 'all')}
                      className={`text-sm transition-all ${
                        filters.platform.length === 0
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Todas
                    </button>
                    {platforms.map((platform) => (
                      <button
                        key={platform}
                        onClick={() => onFilterChange('platform', platform)}
                        className={`text-sm transition-all ${
                          filters.platform.includes(platform)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Status */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Status de Conclusão
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => onFilterChange('status', status.value)}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-all ${
                          filters.status.includes(status.value) || (status.value === 'all' && filters.status.length === 0)
                            ? 'bg-green-600/20 border border-green-500/50 text-green-300'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {(filters.status.includes(status.value) || 
                          (status.value === 'all' && filters.status.length === 0)) && (
                          <FiCheck className="text-sm" />
                        )}
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtros Ativos */}
                {(filters.platform.length > 0 || filters.status.length > 0) && (
                  <div className="space-y-2">
                    <label className="text-white font-medium">Filtros Ativos</label>
                    <div className="flex flex-wrap gap-2">
                      {filters.platform.map(platform => (
                        <div 
                          key={platform} 
                          className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full"
                        >
                          <span className="text-blue-300 text-xs">Plat: {platform}</span>
                          <span
                            onClick={() => onFilterChange('platform', platform)}
                            className="text-blue-400 cursor-pointer hover:text-blue-300 ml-1"
                          >
                            <FaTimes className="text-xs" />
                          </span>
                        </div>
                      ))}
                      {filters.status.map(status => {
                        const statusLabel = statusOptions.find(s => s.value === status)?.label;
                        return (
                          <div 
                            key={status} 
                            className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full"
                          >
                            <span className="text-green-300 text-xs">{statusLabel}</span>
                            <span
                              onClick={() => onFilterChange('status', status)}
                              className="text-green-400 cursor-pointer hover:text-green-300 ml-1"
                            >
                              <FaTimes className="text-xs" />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer do Modal */}
              <div className="flex gap-3 p-4 border-t border-gray-800">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                >
                  <FaRegTrashAlt />
                  Limpar Tudo
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GameFilters;