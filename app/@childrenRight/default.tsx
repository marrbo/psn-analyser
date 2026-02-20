"use client";

import { useScroll } from "@/hooks/useScroll";

export default function ChildrenRightPage() {
  const threshold = 210;
  const { isPastThreshold, scrollY } = useScroll(threshold);
  
    // Calcular topo baseado no scroll
    const calculateTop = () => {
      if (isPastThreshold) {
        return threshold + 'px';
      }
      return `${Math.max(110 - scrollY, 0)}px`;
    };
    
  return (
    <div className={`space-y-4 ${isPastThreshold ? 'fixed top-0 right-0 h-screen' : 'sticky top-110 right-0'}`}
      style={{
        top: isPastThreshold ? '0' : calculateTop(),
        height: isPastThreshold ? '100vh' : 'auto',
      }}>
      
    </div>
  );
}