// components/BackgroundImage.tsx
"use client";

import { useHeader } from "@/providers/HeaderContext";
import { TrophyTitle } from "@/types/trophies";
import { FaImage } from "react-icons/fa";
import AutoTrimImage from "./AutoTrimImage";
import { useEffect, useMemo, useRef } from "react";

export const getBackgroundImages = (focusGame: TrophyTitle | null) => {
  if (focusGame) {
    const gameImages =
      focusGame.gameTitle?.media?.images ||
      focusGame.gameTitle?.concept?.media?.images;

    let heroImage = null;
    let logoImage = null;
    let backgroundImage = null;

    if (gameImages) {
      heroImage =
        gameImages.find((a) => a.type === "HERO_CHARACTER")?.url || null;
      logoImage =
        gameImages.find((a) => a.type === "LOGO")?.url ||
        focusGame.trophyTitleIconUrl ||
        null;
      backgroundImage =
        focusGame.backgroundImage ||
        gameImages.find((a) => a.type === "BACKGROUND_LAYER_ART")?.url ||
        gameImages.find((a) => a.type === "GAMEHUB_COVER_ART")?.url ||
        gameImages.find((a) => a.type === "FOUR_BY_THREE_BANNER")?.url ||
        gameImages[0]?.url ||
        focusGame.trophyTitleIconUrl ||
        "/bg.jpg";

      return { backgroundImage, heroImage, logoImage };
    } else {
      return {
        backgroundImage: focusGame.backgroundImage || "/bg.jpg",
        heroImage: focusGame.heroImage || null,
        logoImage: focusGame.logoImage || null,
      };
    }
  }

  return { backgroundImage: "/bg.jpg", heroImage: null, logoImage: null };
};

export default function BackgroundImage() {
  const {
    show,
    focusGame,
    backgroundImage: contextBackgroundImage,
    heroImage: contextHeroImage,
    setBackgroundImage,
    setHeroImage,
    setLogoImage,
    setCoverImage,
    isMobile,
  } = useHeader();

  const FALLBACK_IMAGE = "/bg.jpg";

  // Refs para rastrear mudanças
  const previousGameIdRef = useRef<string | null>(null);
  const imagesCalculatedRef = useRef(false);

  // Calcular imagens apenas quando focusGame mudar
  const calculatedImages = useMemo(() => {
    const { backgroundImage, heroImage, logoImage } =
      getBackgroundImages(focusGame);

    return { backgroundImage, heroImage, logoImage };
  }, [focusGame]);

  // Efeito para atualizar automaticamente as imagens no contexto
  useEffect(() => {
    const currentGameId = focusGame?.npCommunicationId;

    // Verificar se precisamos atualizar o contexto
    if (
      currentGameId !== previousGameIdRef.current ||
      !imagesCalculatedRef.current
    ) {
      if (focusGame) {
        const { backgroundImage, heroImage, logoImage } = calculatedImages;

        setBackgroundImage(backgroundImage);
        setHeroImage(heroImage);
        setLogoImage(logoImage);
        setCoverImage(setCover(focusGame));
      } else {
        // Reset quando não há jogo focado
        setBackgroundImage(FALLBACK_IMAGE);
        setHeroImage(null);
        setLogoImage(null);
      }

      // Atualizar refs APÓS a atualização do contexto (fora do render)
      previousGameIdRef.current = currentGameId || null;
      imagesCalculatedRef.current = true;
    }
  }, [
    focusGame,
    calculatedImages,
    setBackgroundImage,
    setHeroImage,
    setLogoImage,
    setCoverImage,
  ]);

  // Usar imagens do contexto em vez das calculadas localmente
  const backgroundImage =
    contextBackgroundImage || calculatedImages.backgroundImage;

  const title = `${focusGame?.gameTitle?.localizedName || focusGame?.trophyTitleName} - ${focusGame?.trophyTitlePlatform}`;

  const backgroundStyle = {
    backgroundColor: "transparent",
    backgroundImage: `url(${backgroundImage || FALLBACK_IMAGE})`,
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    width: "100vw",
    height: "100vh",
  };

  if (show === false) {
    return null;
  }

  return (
    <>
      <AutoTrimImage
        src={contextHeroImage}
        maskImage={true}
        className="-z-8 bg-center saturate-30 lg:bg-right fixed bottom-0 right-0 min-h-150 lg:min-h-screen min-w-screen lg:min-w-200 lg:w-auto animate-wind-float-slow"
      />

      {/* <AutoTrimImage 
        src={contextLogoImage} 
        maskImage={false}
        position="center center"
        className="-z-6 hidden sm:block md:block fixed min-w-80 max-w-100 h-35 lg:h-30 object-cover right-20 top-15 lg:top-0"/> */}

      {!isMobile && (
        <>
          <div
            className={`fixed inset-0 -z-7 bg-blend-multiply bg-linear-to-br from-black via-red/80 to-red/15`}
          />

          <div className="-z-5 fixed min-h-145 w-20 left-0 top-0 ">
            <div className="fixed min-w-300 opacity-20 h-10 italic bg-linear-to-b from-transparent via-80% to-black text-right right-2 left-0 lg:bottom-10 xl:-bottom-1 line-clamp-2 isolate mix-blend-difference text-gray-300 font-thin text-xs rotate-270 translate-x-1/2 drop-shadow-sm text-shadow-black/50 text-shadow-2xs">
              <p>
                <FaImage className="inline mr-2" />
                {title}
              </p>
            </div>
          </div>
        </>
      )}

      <div
        className={`fixed -z-15 saturate-10 opacity-80 top-0 bottom-0 left-0 right-0 bg-cover bg-top-center bg-no-repeat scale-120 lg:scale-100 transition-transform duration-1000 ease-in-out`}
        style={backgroundStyle}
      />
    </>
  );
}

function setCover(focusGame: TrophyTitle) {
  const coverImage =
    focusGame?.gameTitle?.concept?.media.images.find((a) => a.type === "MASTER")
      ?.url ||
    focusGame?.gameTitle?.concept?.media.images.find(
      (a) => a.type === "PORTRAIT_BANNER",
    )?.url ||
    focusGame?.gameTitle?.concept?.media.images[1]?.url ||
    focusGame.gameTitle?.localizedImageUrl ||
    focusGame.trophyTitleIconUrl ||
    "/default-game-cover.webp";
  return coverImage;
}
