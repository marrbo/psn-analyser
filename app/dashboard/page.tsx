// app/dashboard/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardContent from "../components/Dashboard";
import { AnalysisData } from "@/lib/mongodb";
import LoadingSpinner from "../components/ui/LoadingSpinner";

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const psnId = searchParams.get("psnId");
    const dataParam = searchParams.get("data");

    const fetchAnalysis = async (psnId: string) => {
      try {
        const response = await fetch(`/api/analyze?psnId=${psnId}`);
        if (response.ok) {
          const data = { psnId, ...(await response.json()) };
          setAnalysisData(data);
        } else {
          throw new Error("Erro ao buscar análise");
        }
      } catch (error) {
        console.error("Erro:", error);
        router.push("/");
      }
    };

    if (dataParam) {
      try {
        const data = { psnId, ...JSON.parse(decodeURIComponent(dataParam)) };

        setAnalysisData(data);
      } catch (error) {
        console.error("Erro ao parsear dados:", error);
        router.push("/");
      }
    } else if (psnId) {
      // Se não tem dados mas tem psnId, buscar da API
      fetchAnalysis(psnId);
    } else {
      router.push("/");
    }

    setIsLoading(false);
  }, [searchParams, router, setAnalysisData]);

  const handleNewAnalysis = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <LoadingSpinner
              title="Dashboard"
              subtitle="Carregando análise..."
            />
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Dados não encontrados</h1>
          <button
            onClick={handleNewAnalysis}
            className="px-6 py-2 bg-linear-to-r from-green-500 to-blue-500 rounded-lg text-white"
          >
            Nova Análise
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardContent data={analysisData} onNewAnalysis={handleNewAnalysis} />
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl text-white">Carregando...</h2>
          </div>
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
