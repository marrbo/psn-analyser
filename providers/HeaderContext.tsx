'use client';

import { SiPlaystation2, SiPlaystation3, SiPlaystation4, SiPlaystation5, SiPlaystationvita } from "react-icons/si";
import { PSNUser } from '@/types/psn';
import { GameTitle, TrophySummary, TrophyTitle } from '@/types/trophies';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AnalysisData } from "@/lib/mongodb";

interface HeaderContextType {
  show: boolean;
  setShow: (show: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  psnUser: PSNUser | null;
  setPsnUser: (psnUser: PSNUser | null | undefined) => void;    
  texto: string;
  setTexto: (texto: string) => void;
  trophyData: TrophySummary | null;
  setTrophyData: (trophyData: TrophySummary | null) => void;
  onClick?: () => void;
  navigateRoute?: string;
  setNavigateRoute: (route: string | undefined) => void;
  setOnClick: (onClick: () => void) => void;
  
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  
  orientation: string;
  isHorizontal: boolean;
  setOrientation: (orientation: string) => void;
  setIsHorizontal: (isHorizontal: boolean) => void;

  analysisData: AnalysisData;
  setAnalysisData: (analysisData: AnalysisData) => void;

  focusGame: GameTitle | null;
  setFocusGame: (game: GameTitle | null) => void;
  
  // Novos estados para imagens
  backgroundImage: string;
  heroImage: string | null;
  logoImage: string | null;
  coverImage: string | null;
  
  // Setters para imagens
  setBackgroundImage: (url: string) => void;
  setHeroImage: (url: string | null) => void;
  setLogoImage: (url: string | null) => void;
  setCoverImage: (url: string | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("Dashboard Padrão");
  const [navigateRoute, setNavigateRoute] = useState("/");
  const [psnUser, setPsnUser] = useState<PSNUser | null>(null);
  const [texto, setTexto] = useState("Dashboard Padrão");
  const [trophyData, setTrophyData] = useState<TrophySummary | null>(null);
  const [focusGame, setFocusGame] = useState<TrophyTitle | null>(null);
  const [onClick, setOnClick] = useState<() => void>(() => {});
  const [backgroundImage, setBackgroundImage] = useState<string>('/bg.jpg');
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState('portrait-primary');
  const [isHorizontal, setIsHorizontal] = useState(false);
  

  // Funções otimizadas
  const stableSetOnClick = useCallback((fn: () => void) => {
    setOnClick(() => fn);
  }, []);

  return (
    <HeaderContext.Provider value={{ 
      show, setShow, 
      title, setTitle, 
      psnUser, setPsnUser, 
      texto, setTexto, 
      trophyData, setTrophyData, 
      onClick, setOnClick: stableSetOnClick,
      focusGame, setFocusGame,
      backgroundImage, setBackgroundImage,
      analysisData, setAnalysisData,
      navigateRoute, setNavigateRoute,
      heroImage, setHeroImage,
      logoImage, setLogoImage,
      coverImage, setCoverImage,
      isMobile, setIsMobile,
      orientation, setOrientation,
      isHorizontal, setIsHorizontal
    }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }

  return {
    show: context.show,
    setShow: context.setShow,
    title: context.title,
    setTitle: context.setTitle,
    psnUser: context.psnUser,
    setPsnUser: context.setPsnUser,
    texto: context.texto,
    setTexto: context.setTexto,
    trophyData: context.trophyData,
    setTrophyData: context.setTrophyData,
    onClick: context.onClick,
    setOnClick: context.setOnClick,
    navigateRoute: context.navigateRoute,
    setNavigateRoute: context.setNavigateRoute,
    focusGame: context.focusGame,
    setFocusGame: context.setFocusGame,
    backgroundImage: context.backgroundImage,
    setBackgroundImage: context.setBackgroundImage,
    heroImage: context.heroImage,
    setHeroImage: context.setHeroImage,
    logoImage: context.logoImage,
    setLogoImage: context.setLogoImage,
    coverImage: context.coverImage,
    setCoverImage: context.setCoverImage,
    analysisData: context.analysisData,
    setAnalysisData: context.setAnalysisData,
    isMobile: context.isMobile,
    setIsMobile: context.setIsMobile,
    orientation: context.orientation, 
    setOrientation: context.setOrientation,
    isHorizontal: context.isHorizontal, 
    setIsHorizontal: context.setIsHorizontal
  };
};

export const getPlatform = (game: GameTitle, size = 24) => {
    switch (game.category || game?.trophyTitle?.trophyTitlePlatform) {
      case 'PS4':
      case 'ps4_game':
        return <SiPlaystation4 size={size} className="h-6 p-0 m-0 -mt-1"/>
      case 'PS5':
      case 'ps5_native_game':
        return <SiPlaystation5 size={size} className="h-6 p-0 m-0 -mt-1"/>
      case 'PS5,PSPC':
        return <SiPlaystation5 size={size} className="h-6 p-0 m-0 -mt-1"/>
      case 'PS3':
        return <SiPlaystation3 size={size} className="h-6 p-0 m-0 -mt-1"/>
      case 'PS2':
        return <SiPlaystation2 size={size} className="h-6 p-0 m-0 -mt-1"/>
      case 'PSVITA,PS4':
        return <div className="flex flex-row justify-end gap-0 items-center p-0 m-0 -mt-1"><SiPlaystationvita size={size+5} className="h-8 p-0 m-0 -mt-1 w-10" />&nbsp;&nbsp;<SiPlaystation4 size={size} className="h-6 p-0 m-0 -mt-1" /></div>
      case 'PS3,PSVITA,PS4':
        return <div className="flex flex-row justify-end gap-0 items-center p-0 m-0 -mt-1"><SiPlaystation3 size={size} className="h-6 p-0 m-0 -mt-1" />&nbsp;&nbsp;<SiPlaystationvita size={size+5} className="h-8 p-0 m-0 -mt-1  w-10" />&nbsp;&nbsp;<SiPlaystation4 size={size} className="h-6 p-0 m-0 -mt-1"/></div>
    }
  }