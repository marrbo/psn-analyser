// app/page.tsx
import { Suspense } from 'react';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Simular busca de dados - na prática viria de uma API
async function getUserData() {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    profile: "me",
    migueScore: 74,
    platinas: 124,
    totalGames: 291,
    completionRate: 50,
    level: 440,
    stats: {
      platinasCount: 13,
      completeness: 11,
      rarePlatinas: 20,
      goty: 15,
      highDifficulty: 15
    },
    genres: [
      { name: "Other", games: 252, platinas: 109, completion: 58.1 },
      { name: "Action/Adventure", games: 18, platinas: 9, completion: 55.5 },
      { name: "Sports", games: 6, platinas: 1, completion: 34.17 },
      { name: "Platform", games: 5, platinas: 4, completion: 80.2 }
    ]
  };
}

export default async function Home() {
  const userData = await getUserData();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Dashboard data={userData} />
    </Suspense>
  );
}