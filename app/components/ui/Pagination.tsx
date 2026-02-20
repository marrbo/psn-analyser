// app/components/ui/Pagination.tsx
'use client';

import { useEffect, useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxVisibleButtons?: number;
  showSummary?: boolean;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxVisibleButtons = 5,
  showSummary = true,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [visiblePages, setVisiblePages] = useState<number[]>([]);

  // Calcular páginas visíveis com janela deslizante
  useEffect(() => {
    const pages: number[] = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Ajustar se não temos páginas suficientes no início
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    setVisiblePages(pages);
  }, [currentPage, totalPages, maxVisibleButtons]);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      // Rolar suavemente para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPageButtons = () => {
    const buttons = [];

    // Botão Primeira Página
    if (currentPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="btn btn-sm btn-ghost"
          aria-label="Primeira página"
        >
          ««
        </button>
      );
    }

    // Botão Página Anterior
    if (currentPage > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="btn btn-sm btn-ghost"
          aria-label="Página anterior"
        >
          «
        </button>
      );
    }

    // Mostrar "..." no início se necessário
    if (visiblePages[0] > 1) {
      buttons.push(
        <button
          key="start-ellipsis"
          className="btn btn-sm btn-disabled"
          disabled
        >
          ...
        </button>
      );
    }

    // Botões das páginas
    visiblePages.forEach(page => {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`btn btn-sm ${
            currentPage === page
              ? 'btn-primary text-white'
              : 'btn-ghost'
          }`}
          aria-label={`Página ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      );
    });

    // Mostrar "..." no final se necessário
    if (visiblePages[visiblePages.length - 1] < totalPages) {
      buttons.push(
        <button
          key="end-ellipsis"
          className="btn btn-sm btn-disabled"
          disabled
        >
          ...
        </button>
      );
    }

    // Botão Próxima Página
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="btn btn-sm btn-ghost"
          aria-label="Próxima página"
        >
          »
        </button>
      );
    }

    // Botão Última Página
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="btn btn-sm btn-ghost"
          aria-label="Última página"
        >
          »»
        </button>
      );
    }

    return buttons;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-4 p-4 bg-base-100/5 backdrop-blur-sm rounded-box">
      {showSummary && totalItems > 0 && (
        <div className="text-sm text-base-content/70">
          Mostrando <span className="font-semibold">{startItem}-{endItem}</span> de{' '}
          <span className="font-semibold">{totalItems.toLocaleString('pt-BR')}</span> jogos
        </div>
      )}

      <div className="flex items-center gap-1">
        {renderPageButtons()}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-base-content/70">Itens por página:</span>
        <select
          className="select select-sm select-bordered w-20"
          value={itemsPerPage}
          onChange={(e) => {
            const newItemsPerPage = parseInt(e.target.value);
            // Recalcular página atual para manter o item visível
            const newPage = Math.floor(startItem / newItemsPerPage) + 1;
            onPageChange(newPage);
            // Nota: O itemsPerPage será controlado pelo componente pai
            // Precisamos alterar a lógica no componente pai
          }}
        >
          {[12, 24, 36, 48, 60].map(num => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}