// app/hooks/useScroll.ts
'use client';

import { useState, useEffect } from 'react';

export const useScroll = (threshold = 110) => {
  const [isPastThreshold, setIsPastThreshold] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsPastThreshold(currentScrollY > threshold);
    };

    handleScroll(); // Verificar estado inicial
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { isPastThreshold, scrollY };
};