// components/ui/AutoTrimImage.tsx
'use client';

import { url } from 'node:inspector';
import { useState, useEffect, useRef } from 'react';
import { FaSpinner } from 'react-icons/fa';
import sharp from 'sharp';

interface AutoTrimImageProps {
  src: string | null;
  className?: string;
  width?: number;
  height?: number;
  padding?: number; // pixels de padding após o corte
  quality?: number; // 1-100
  fallbackSrc?: string; // URL alternativa se falhar
  maskImage?: boolean; // URL da imagem de máscara personalizada
  position?: string; // Posição do background
  onLoad?: () => void;
} 

export default function AutoTrimImage({
  src,
  className = '',
  padding = 0,
  quality = 80,
  fallbackSrc,
  maskImage = false,
  position = 'center top',
  onLoad,
}: AutoTrimImageProps) {
  const [processedSrc, setProcessedSrc] = useState<string | null>(src);
  const [isLoading, setIsLoading] = useState(true);

  // Use um ref para prevenir processamento duplicado
  const hasProcessed = useRef<{imageData: string, url: string}[]>([]);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    // Se já processamos ou não temos URL, não fazemos nada
    const imageDataExists = hasProcessed.current?.find(item => item.url === src);
    
    if (imageDataExists) {
      setProcessedSrc(imageDataExists.imageData);
      setIsLoading(false);
      if (onLoad) onLoad();
      return;
    }

    // Função para processar a imagem
    const processImage = async () => {
      try {
        setIsLoading(true);
        
        // Chama a API de processamento
        const response = await fetch('/api/trim-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: src,
            padding,
            quality,
          }),
        });

        if (!response.ok) {
          throw new Error(`API response error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.imageData) {
          hasProcessed.current.push({url: src, imageData: result.imageData}); // Marcar como processando
          setProcessedSrc(result.imageData);
        } else {
          throw new Error(result.error || 'Falha ao processar imagem');
        }
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        
        // Usar fallback se disponível
        if (fallbackSrc) {
          setProcessedSrc(fallbackSrc);
        }
      } finally {
        setIsLoading(false);
        if (onLoad) onLoad();
      }
    };

    processImage();
  }, [src, padding, quality, fallbackSrc, onLoad]);

  const maskGradient = "linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 100%)";


  if (!src) return (
    <div className={`${className || 'relative inline-block'}`}/>
  );

  return (
    <div className={`${className || 'relative inline-block'}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="text-white text-2xl">
                <FaSpinner className="animate-spin" /> 
            </span>
          </div>
        </div>
      )}
      {!isLoading && (
      <div
          className={`${className || 'relative inline-block'}`}
          style={{
            backgroundColor: "transparent",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundImage: `url(${processedSrc})`,
            backgroundPosition: position,
            maskImage: maskImage ? maskGradient : undefined,
            WebkitMaskImage: maskImage ? maskGradient : undefined,
            objectFit: "contain"}}
        ></div>)}
    </div>
  );
}