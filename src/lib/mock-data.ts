// src/lib/mock-data.ts
import { Game } from '@/types/psn';

export function getMockGames(psnId: string): Game[] {
  return [
    {
      title: 'The Last of Us Part II',
      platform: 'PS4',
      trophyCount: {
        bronze: 12,
        silver: 8,
        gold: 4,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 12,
        silver: 8,
        gold: 4,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2024-01-15'),
      genre: 'Action/Adventure',
      timeToPlatinum: 25,
      metacriticScore: 93,
      isGoty: true,
      difficulty: 8,
      rarity: 15,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'God of War Ragnarok',
      platform: 'PS5',
      trophyCount: {
        bronze: 15,
        silver: 10,
        gold: 5,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 15,
        silver: 10,
        gold: 5,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2024-02-20'),
      genre: 'Action/Adventure',
      timeToPlatinum: 35,
      metacriticScore: 94,
      isGoty: true,
      difficulty: 7,
      rarity: 18,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Bloodborne',
      platform: 'PS4',
      trophyCount: {
        bronze: 18,
        silver: 12,
        gold: 6,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 18,
        silver: 12,
        gold: 6,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-11-10'),
      genre: 'RPG/Action',
      timeToPlatinum: 60,
      metacriticScore: 92,
      isGoty: true,
      difficulty: 9,
      rarity: 25,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Persona 5 Royal',
      platform: 'PS4',
      trophyCount: {
        bronze: 22,
        silver: 14,
        gold: 7,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 22,
        silver: 14,
        gold: 7,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-12-05'),
      genre: 'RPG',
      timeToPlatinum: 120,
      metacriticScore: 95,
      isGoty: false,
      difficulty: 6,
      rarity: 20,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: false
    },
    {
      title: 'Hollow Knight',
      platform: 'PS4',
      trophyCount: {
        bronze: 16,
        silver: 11,
        gold: 5,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 16,
        silver: 11,
        gold: 5,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-10-12'),
      genre: 'Platform',
      timeToPlatinum: 40,
      metacriticScore: 90,
      isGoty: false,
      difficulty: 8,
      rarity: 30,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Spider-Man: Miles Morales',
      platform: 'PS5',
      trophyCount: {
        bronze: 13,
        silver: 9,
        gold: 4,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 13,
        silver: 9,
        gold: 4,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2024-01-08'),
      genre: 'Action/Adventure',
      timeToPlatinum: 18,
      metacriticScore: 85,
      isGoty: false,
      difficulty: 4,
      rarity: 12,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: false,
      isHighDifficulty: false
    },
    {
      title: 'Demon\'s Souls',
      platform: 'PS5',
      trophyCount: {
        bronze: 20,
        silver: 13,
        gold: 6,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 20,
        silver: 13,
        gold: 6,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-12-25'),
      genre: 'RPG/Action',
      timeToPlatinum: 50,
      metacriticScore: 92,
      isGoty: false,
      difficulty: 9,
      rarity: 22,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Final Fantasy VII Remake',
      platform: 'PS4',
      trophyCount: {
        bronze: 24,
        silver: 15,
        gold: 8,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 24,
        silver: 15,
        gold: 8,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-09-15'),
      genre: 'RPG',
      timeToPlatinum: 80,
      metacriticScore: 87,
      isGoty: false,
      difficulty: 7,
      rarity: 19,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Crash Bandicoot 4: It\'s About Time',
      platform: 'PS4',
      trophyCount: {
        bronze: 25,
        silver: 16,
        gold: 8,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 25,
        silver: 16,
        gold: 8,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-08-20'),
      genre: 'Platform',
      timeToPlatinum: 45,
      metacriticScore: 85,
      isGoty: false,
      difficulty: 8,
      rarity: 28,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Ghost of Tsushima',
      platform: 'PS4',
      trophyCount: {
        bronze: 21,
        silver: 12,
        gold: 6,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 21,
        silver: 12,
        gold: 6,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-11-30'),
      genre: 'Action/Adventure',
      timeToPlatinum: 55,
      metacriticScore: 83,
      isGoty: false,
      difficulty: 6,
      rarity: 16,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: false,
      isHighDifficulty: false
    },
    {
      title: 'Elden Ring',
      platform: 'PS5',
      trophyCount: {
        bronze: 30,
        silver: 18,
        gold: 10,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 30,
        silver: 18,
        gold: 10,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2024-03-01'),
      genre: 'RPG/Action',
      timeToPlatinum: 95,
      metacriticScore: 96,
      isGoty: true,
      difficulty: 9,
      rarity: 35,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Returnal',
      platform: 'PS5',
      trophyCount: {
        bronze: 14,
        silver: 10,
        gold: 5,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 14,
        silver: 10,
        gold: 5,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-10-05'),
      genre: 'Action/Adventure',
      timeToPlatinum: 65,
      metacriticScore: 86,
      isGoty: false,
      difficulty: 8,
      rarity: 24,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Ratchet & Clank: Rift Apart',
      platform: 'PS5',
      trophyCount: {
        bronze: 16,
        silver: 11,
        gold: 5,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 16,
        silver: 11,
        gold: 5,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2024-02-10'),
      genre: 'Action/Adventure',
      timeToPlatinum: 22,
      metacriticScore: 88,
      isGoty: false,
      difficulty: 4,
      rarity: 14,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: false,
      isHighDifficulty: false
    },
    {
      title: 'Horizon Forbidden West',
      platform: 'PS5',
      trophyCount: {
        bronze: 19,
        silver: 13,
        gold: 6,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 19,
        silver: 13,
        gold: 6,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-12-18'),
      genre: 'Action/Adventure',
      timeToPlatinum: 70,
      metacriticScore: 88,
      isGoty: false,
      difficulty: 6,
      rarity: 17,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: false,
      isHighDifficulty: false
    },
    {
      title: 'Sekiro: Shadows Die Twice',
      platform: 'PS4',
      trophyCount: {
        bronze: 22,
        silver: 14,
        gold: 7,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 22,
        silver: 14,
        gold: 7,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-07-22'),
      genre: 'RPG/Action',
      timeToPlatinum: 75,
      metacriticScore: 90,
      isGoty: true,
      difficulty: 9,
      rarity: 32,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'The Witcher 3: Wild Hunt',
      platform: 'PS4',
      trophyCount: {
        bronze: 28,
        silver: 16,
        gold: 9,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 28,
        silver: 16,
        gold: 9,
        platinum: 1
      },
      progress: 100,
      lastPlayed: new Date('2023-06-10'),
      genre: 'RPG',
      timeToPlatinum: 110,
      metacriticScore: 92,
      isGoty: true,
      difficulty: 7,
      rarity: 26,
      hasPlatinum: true,
      completionPercentage: 100,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Celeste',
      platform: 'PS4',
      trophyCount: {
        bronze: 12,
        silver: 8,
        gold: 4,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 12,
        silver: 8,
        gold: 4,
        platinum: 0
      },
      progress: 85,
      lastPlayed: new Date('2024-01-25'),
      genre: 'Platform',
      timeToPlatinum: 0,
      metacriticScore: 92,
      isGoty: false,
      difficulty: 8,
      rarity: 29,
      hasPlatinum: false,
      completionPercentage: 85,
      isRare: true,
      isHighDifficulty: true
    },
    {
      title: 'Stardew Valley',
      platform: 'PS4',
      trophyCount: {
        bronze: 15,
        silver: 10,
        gold: 5,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 10,
        silver: 6,
        gold: 2,
        platinum: 0
      },
      progress: 65,
      lastPlayed: new Date('2024-02-28'),
      genre: 'RPG',
      timeToPlatinum: 0,
      metacriticScore: 89,
      isGoty: false,
      difficulty: 5,
      rarity: 21,
      hasPlatinum: false,
      completionPercentage: 65,
      isRare: true,
      isHighDifficulty: false
    },
    {
      title: 'Death Stranding',
      platform: 'PS4',
      trophyCount: {
        bronze: 20,
        silver: 12,
        gold: 6,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 18,
        silver: 10,
        gold: 5,
        platinum: 1
      },
      progress: 95,
      lastPlayed: new Date('2023-11-15'),
      genre: 'Action/Adventure',
      timeToPlatinum: 85,
      metacriticScore: 82,
      isGoty: false,
      difficulty: 6,
      rarity: 23,
      hasPlatinum: true,
      completionPercentage: 95,
      isRare: true,
      isHighDifficulty: false
    },
    {
      title: 'Cyberpunk 2077',
      platform: 'PS5',
      trophyCount: {
        bronze: 25,
        silver: 15,
        gold: 8,
        platinum: 1
      },
      earnedTrophies: {
        bronze: 20,
        silver: 12,
        gold: 6,
        platinum: 1
      },
      progress: 90,
      lastPlayed: new Date('2024-03-05'),
      genre: 'RPG',
      timeToPlatinum: 90,
      metacriticScore: 86,
      isGoty: false,
      difficulty: 6,
      rarity: 19,
      hasPlatinum: true,
      completionPercentage: 90,
      isRare: true,
      isHighDifficulty: false
    }
  ];
}

// Função para gerar um perfil mock completo
export function getMockProfile(psnId: string) {
  return {
    accountId: psnId,
    profile: {
      onlineId: psnId,
      aboutMe: `Trophy hunter dedicado com foco em jogos de alta qualidade e desafio.`,
      avatars: [
        {
          size: 'large',
          url: '/default-avatar.png'
        }
      ],
      isPlus: true,
      isVerified: true
    },
    games: getMockGames(psnId)
  };
}