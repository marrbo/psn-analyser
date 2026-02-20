import { useState, useEffect } from 'react';
import { FaArrowCircleDown, FaArrowCircleUp } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from "react-icons/md";

interface PaginationWithIconsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLoadMore?: () => Promise<void>; // Nova prop para carregar mais itens
  hasMore?: boolean; // Controla se há mais itens para carregar
  isLoading?: boolean; // Estado de carregamento
}

const PaginationWithIcons = ({
  currentPage,
  totalPages,
  onPageChange,
  onLoadMore,
  hasMore = false,
  isLoading = false
}: PaginationWithIconsProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detecta se está em mobile
  useEffect(() => {
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint do Tailwind
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Função para carregar mais itens (modo mobile)
  const handleLoadMore = async () => {
    if (onLoadMore && !isLoading) {
      await onLoadMore();
    }
  };

  const scrollToTop = () => {
    // Alternativa 2: Para um elemento específico
    const element = document.getElementById('layout');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Se estiver em mobile e tiver a funcionalidade de "mostrar mais"
  if (isMobile && onLoadMore) {
    return (
      <div className="flex justify-center gap-4">
        <button
          className={`${hasMore ? '' : 'hidden'} flex justify-center min-w-50 items-center align-middle mb-10`}
          onClick={hasMore ? handleLoadMore : scrollToTop}
          disabled={isLoading}
          aria-label="Mostrar mais ..."
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              Carregando...
            </span>
          ) : (
            <>
              <FaArrowCircleDown className="mr-2 w-6 h-6" />
              Mostrar mais
            </>
          )}
        </button>
        <button
          className={`flex justify-center w-12 h-12 items-center align-middle fixed bottom-3 right-3 rounded-full bg-blue-500/30`}
          onClick={scrollToTop}
          aria-label="voltar ao Topo"
          title='Voltar ao topo'
        >
          <>
            <FaArrowCircleUp className="w-6 h-6" />
          </>
        </button>
      </div>
    );
  }

  // Paginação tradicional para desktop
  return (
    <>
    <div className="join mb">
      {/* Primeira página */}
      {currentPage  > 1 && (
      <button className="join-item h-12 w-12" 
        onClick={() => onPageChange(1)}>
        <MdFirstPage className="w-8 h-4" />
      </button>
      )}

      {/* Botão anterior */}
      {currentPage > 1 && (
      <button
        className="join-item h-12 w-12"
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Página anterior"
        disabled={currentPage === 1}
      >
        <MdChevronLeft className="w-8 h-4" />
      </button>
      )}

      {/* Página atual */}
      {currentPage - 2 > 0 && (
      <button className="join-item h-12 w-12 flex items-center justify-center" 
        onClick={() => onPageChange(currentPage - 2)}>
        {currentPage-2}
      </button>
      )}
      
      {currentPage - 1 > 0 && (
        <button className="join-item h-12 w-12 flex items-center justify-center" 
          onClick={() => onPageChange(currentPage - 1)}>
          {currentPage-1}
        </button>
      )}
      
      <button className="join-item h-12 w-12 bg-green-500 font-bold text-black text-xl flex items-center justify-center" disabled>
        {currentPage}
      </button>
      
      {currentPage + 1 <= totalPages && (
      <button className="join-item h-12 w-12 flex items-center justify-center" 
        onClick={() => onPageChange(currentPage + 1)}>
        {currentPage + 1}
      </button>
      )}
      
      {currentPage+2 <= totalPages && (
        <button className="join-item h-12 w-12 flex items-center justify-center" 
          onClick={() => onPageChange(currentPage + 2)}>
          {currentPage + 2}
        </button>
      )}

      {/* Botão próximo */}
      {currentPage < totalPages && (
      <button
        className="join-item h-12 w-12 flex items-center justify-center"
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Próxima página"
        disabled={currentPage === totalPages}
      >
        <MdChevronRight className="w-8 h-4" />
      </button>
      )}

      {/* Última página */}
      {currentPage < totalPages && (
      <button className="join-item h-12 w-12 " 
        onClick={() => onPageChange(totalPages)}>
        <MdLastPage className="w-8 h-4" />
      </button>
      )}
    </div>
    <span className="ml-4 text-sm">(Página {currentPage} de {totalPages})</span>
    </>
  );
};

export default PaginationWithIcons;