"use client";

import { useParams, useRouter } from "next/navigation";
import { useHeader } from "@/providers/HeaderContext";
import { FaHome } from "react-icons/fa";
import { MdAutorenew } from "react-icons/md";
import { IoLogoGameControllerB } from "react-icons/io";
import { BiAnalyse } from "react-icons/bi";
import { useEffect, useState } from "react";

function NavigationBarComponent() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const {
    psnUser,
    setBackgroundImage,
    setLogoImage,
    setHeroImage,
    setAnalysisData,
    setNavigateRoute,
    setIsMobile,
  } = useHeader();

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;

      const isMobileSize = window.innerWidth < 1024;
      const isMobileDevice = /mobile/i.test(ua);

      setIsMobile(isMobileSize || isMobileDevice);
    

      console.log("isMobile: ", isMobileSize || isMobileDevice);
    };

    window.addEventListener("resize", checkDevice);
    window.addEventListener("load", checkDevice);

    return () => { 
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("load", checkDevice); 
    };
  });

  const handleAnalysisStart = async (accountId: string) => {
    try {
      const npCommunicationId = params.npCommunicationId as string;

      setIsLoading(true);

      const response = await fetch("/api/analyze/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: accountId,
          npCommunicationId: npCommunicationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na análise");
      }

      // Se é análise em cache, redirecionar imediatamente
      if (data && data.analysisId) {
        if (npCommunicationId) {
          setAnalysisData(data);
          setBackgroundImage(data.games[0].backgroundImage);
          setHeroImage(data.games[0].heroImage);
          setLogoImage(data.games[0].logoImage);
          setIsLoading(false);
        }
        router.push(`${document.location.href}`);
      }
    } catch (error) {
      console.error("Erro ao iniciar análise:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = (route: string) => {
    let navigate;
    let isNavigate = false;

    switch (route) {
      case "/analyses/new":
        navigate = `/login`;
        isNavigate = true;
        break;
      case "/dashboard":
        if (psnUser) {
          navigate = `/dashboard/${psnUser?.lastAnalysisId}`;
          isNavigate = true;
        }
        break;
      case "/games":
        if (psnUser) {
          navigate = `/games?analysisId=${psnUser?.lastAnalysisId}&accountId=${psnUser?.accountId}`;
          isNavigate = true;
        }
        break;
      default:
        navigate = route;
        isNavigate = false;
        break;
    }

    if (!isNavigate) return;

    setNavigateRoute(navigate);
    router.push(navigate);
  };

  return (
    <>
      <div id="NavigationBar"
        className="fixed h-20 z-900 bottom-0 rounded-t-3xl right-0 bg-black/80 border-white/30 border-t-2 
        lg:border-none lg:bg-transparent lg:top-7 lg:right-5 w-full lg:w-80 p-4 items-center flex text-xs gap-4 justify-between"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white/15 p-3 hover:bg-red-500"
        >
          <FaHome className="size-6" />
        </button>
        <button onClick={() => navigate("/games")} className="p-3 bg-white/15">
          <IoLogoGameControllerB className="size-6" />
        </button>
        {/* <button onClick={() => handleBack()} >
          <MdOutlineArrowBackIosNew className="size-6" />
        </button> */}
        <button
          disabled={isLoading}
          className={`p-3 ${isLoading ? "bg-yellow-400" : "bg-white/15"}`}
          onClick={async () =>
            await handleAnalysisStart(`${psnUser?.accountId}`)
          }
        >
          <MdAutorenew
            className={`size-6 ${isLoading ? "animate-spin text-black" : "text-white"}`}
          />
        </button>
        <button
          onClick={() => navigate("/analyses/new")}
          className="p-3 bg-white/15"
        >
          <BiAnalyse className="size-6" />
        </button>
      </div>
    </>
  );
}

export default NavigationBarComponent;
