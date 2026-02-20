// scripts/migrate-goty-images.ts

import { MongoClient } from 'mongodb';
import { IGDBService } from '../services/igdb-service';

interface GOTYGame {
    id?: number,
    titulo: string;
    ano_premiacao: number;
    desenvolvedora: string;
    metacritic_score: number;
    plataformas: Array<string>;
    imagem_capa?: string | null;
    search_terms: Array<string>;
    alternative_titles: Array<string>;
}

async function migrateGOTYImages() {
    const client = new MongoClient("mongodb://localhost:27017/psn_analyser");
    const igdbService = IGDBService.getInstance();

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db("psn_analyser");
        
        // Create or get the GOTY games collection
        // MongoDB creates collections automatically when first inserted[citation:5]
        const gotyCollection = database.collection<GOTYGame>('goty_games');

        const listaGoty: GOTYGame[] = [
            {
                titulo: "Clair Obscur: Expedition 33",
                ano_premiacao: 2025,
                desenvolvedora: "Larian Studios",
                metacritic_score: 92,
                plataformas: ["PC", "PS5", "Xbox Series X/S"],
                imagem_capa: null,
                search_terms: ["clair obscur: expedition 33", "clair obscur expedition 33", "coe33", "clair obscur"],
                alternative_titles: ["Clair Obscur: Expedition 33", "Clair Obscur Expedition 33", "Clair Obscur Expedition 33"]
            },
            {
                titulo: "Astro Bot",
                ano_premiacao: 2024,
                desenvolvedora: "Team ASOBI",
                metacritic_score: 94,
                plataformas: ["PS5"],
                imagem_capa: null,
                search_terms: ["astro bot"],
                alternative_titles: ["Astro Bot"]
            },
            {
                titulo: "Baldur's Gate 3",
                ano_premiacao: 2023,
                desenvolvedora: "Larian Studios",
                metacritic_score: 96,
                plataformas: ["PC", "PS5", "Xbox Series X/S"],
                imagem_capa: null,
                search_terms: ["baldur's gate 3", "baldurs gate 3", "bg3"],
                alternative_titles: ["Baldur's Gate III"]
            },
            {
                titulo: "Elden Ring",
                ano_premiacao: 2022,
                desenvolvedora: "FromSoftware",
                metacritic_score: 96,
                plataformas: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S"],
                imagem_capa: null,
                search_terms: ["elden ring"],
                alternative_titles: []
            },
            {
                titulo: "It Takes Two",
                ano_premiacao: 2021,
                desenvolvedora: "Hazelight Studios",
                metacritic_score: 88,
                plataformas: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X/S", "Switch"],
                imagem_capa: null,
                search_terms: ["it takes two"],
                alternative_titles: []
            },
            {
                titulo: "The Last of Us Part II",
                ano_premiacao: 2020,
                desenvolvedora: "Naughty Dog",
                metacritic_score: 93,
                plataformas: ["PS4"],
                imagem_capa: null,
                search_terms: ["the last of us part ii", "the last of us part 2", "the last of us 2", "tlou2"],
                alternative_titles: ["The Last of Us Part 2", "The Last of Us 2"]
            },
            {
                titulo: "Sekiro: Shadows Die Twice",
                ano_premiacao: 2019,
                desenvolvedora: "FromSoftware",
                metacritic_score: 90,
                plataformas: ["PC", "PS4", "Xbox One"],
                imagem_capa: null,
                search_terms: ["sekiro", "sekiro shadows die twice"],
                alternative_titles: ["Sekiro: Shadows Die Twice"]
            },
            {
                titulo: "God of War",
                ano_premiacao: 2018,
                desenvolvedora: "Santa Monica Studio",
                metacritic_score: 94,
                plataformas: ["PS4", "PC"],
                imagem_capa: null,
                search_terms: ["god of war", "gow 2018"],
                alternative_titles: ["God of War (2018)"]
            },
            {
                titulo: "The Legend of Zelda: Breath of the Wild",
                ano_premiacao: 2017,
                desenvolvedora: "Nintendo",
                metacritic_score: 97,
                plataformas: ["Switch", "Wii U"],
                imagem_capa: null,
                search_terms: ["zelda breath of the wild", "breath of the wild", "botw"],
                alternative_titles: ["Zelda: BOTW", "Breath of the Wild"]
            },
            {
                titulo: "Overwatch",
                ano_premiacao: 2016,
                desenvolvedora: "Blizzard Entertainment",
                metacritic_score: 91,
                plataformas: ["PC", "PS4", "Xbox One", "Switch"],
                imagem_capa: null,
                search_terms: ["overwatch"],
                alternative_titles: ["Overwatch 1"]
            },
            {
                titulo: "The Witcher 3: Wild Hunt",
                ano_premiacao: 2015,
                desenvolvedora: "CD Projekt Red",
                metacritic_score: 92,
                plataformas: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X/S"],
                imagem_capa: null,
                search_terms: ["witcher 3", "the witcher 3", "wild hunt"],
                alternative_titles: ["The Witcher 3", "Witcher 3: Wild Hunt"]
            },
            {
                titulo: "Dragon Age: Inquisition",
                ano_premiacao: 2014,
                desenvolvedora: "BioWare",
                metacritic_score: 85,
                plataformas: ["PC", "PS3", "PS4", "Xbox 360", "Xbox One"],
                imagem_capa: null,
                search_terms: ["dragon age inquisition"],
                alternative_titles: ["Dragon Age 3"]
            },
            {
                titulo: "Grand Theft Auto V",
                ano_premiacao: 2013,
                desenvolvedora: "Rockstar North",
                metacritic_score: 97,
                plataformas: ["PC", "PS3", "PS4", "PS5", "Xbox 360", "Xbox One", "Xbox Series X/S"],
                imagem_capa: null,
                search_terms: ["gta v", "grand theft auto v", "gta 5"],
                alternative_titles: ["GTA V", "Grand Theft Auto 5"]
            },
            {
                titulo: "The Walking Dead",
                ano_premiacao: 2012,
                desenvolvedora: "Telltale Games",
                metacritic_score: 89,
                plataformas: ["PC", "PS3", "Xbox 360", "Mobile"],
                imagem_capa: null,
                search_terms: ["the walking dead", "walking dead telltale"],
                alternative_titles: ["Walking Dead: The Game"]
            },
            {
                titulo: "The Elder Scrolls V: Skyrim",
                ano_premiacao: 2011,
                desenvolvedora: "Bethesda Game Studios",
                metacritic_score: 96,
                plataformas: ["PC", "PS3", "Xbox 360", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X/S"],
                imagem_capa: null,
                search_terms: ["skyrim", "elder scrolls skyrim", "the elder scrolls v"],
                alternative_titles: ["Skyrim", "Elder Scrolls V"]
            },
            {
                titulo: "Red Dead Redemption",
                ano_premiacao: 2010,
                desenvolvedora: "Rockstar San Diego",
                metacritic_score: 95,
                plataformas: ["PS3", "Xbox 360", "Switch", "PS4"],
                imagem_capa: null,
                search_terms: ["red dead redemption"],
                alternative_titles: ["RDR"]
            },
            {
                titulo: "Uncharted 2: Among Thieves",
                ano_premiacao: 2009,
                desenvolvedora: "Naughty Dog",
                metacritic_score: 96,
                plataformas: ["PS3"],
                imagem_capa: null,
                search_terms: ["uncharted 2", "among thieves"],
                alternative_titles: ["Uncharted 2"]
            },
            {
                titulo: "Grand Theft Auto IV",
                ano_premiacao: 2008,
                desenvolvedora: "Rockstar North",
                metacritic_score: 98,
                plataformas: ["PC", "PS3", "Xbox 360"],
                imagem_capa: null,
                search_terms: ["gta iv", "grand theft auto iv", "gta 4"],
                alternative_titles: ["GTA IV", "Grand Theft Auto 4"]
            },
            {
                titulo: "BioShock",
                ano_premiacao: 2007,
                desenvolvedora: "Irrational Games",
                metacritic_score: 96,
                plataformas: ["PC", "PS3", "Xbox 360"],
                imagem_capa: null,
                search_terms: ["bioshock"],
                alternative_titles: []
            },
            {
                titulo: "The Elder Scrolls IV: Oblivion",
                ano_premiacao: 2006,
                desenvolvedora: "Bethesda Game Studios",
                metacritic_score: 94,
                plataformas: ["PC", "PS3", "Xbox 360"],
                imagem_capa: null,
                search_terms: ["oblivion", "elder scrolls oblivion"],
                alternative_titles: ["Oblivion"]
            },
            {
                titulo: "Resident Evil 4",
                ano_premiacao: 2005,
                desenvolvedora: "Capcom",
                metacritic_score: 96,
                plataformas: ["GameCube", "PS2", "PC", "Wii", "PS3", "Xbox 360", "PS4", "Xbox One", "Switch"],
                imagem_capa: null,
                search_terms: ["resident evil 4", "re4"],
                alternative_titles: ["RE4"]
            },
            {
                titulo: "Grand Theft Auto: San Andreas",
                ano_premiacao: 2004,
                desenvolvedora: "Rockstar North",
                metacritic_score: 95,
                plataformas: ["PS2", "PC", "Xbox"],
                imagem_capa: null,
                search_terms: ["gta san andreas", "san andreas"],
                alternative_titles: ["GTA: San Andreas"]
            }
            ];


        console.log(`Found ${listaGoty.length} games without cover images`);
        
        for (const game of listaGoty) {
            console.log(`Searching cover for: ${game.titulo}`);
            
            const gameData = await igdbService.searchGameCover(game.titulo);

            if (gameData) {
                game.imagem_capa = gameData.cover;

                await gotyCollection.updateOne(
                    { 
                        titulo: game.titulo,
                        ano_premiacao: game.ano_premiacao
                    },
                    { 
                        $setOnInsert: {
                            ...game,
                            createdAt: new Date()
                        },
                        $set: {
                            updatedAt: new Date()
                        }
                    },
                    { upsert: true }
                );

                console.log(`✓ Updated cover for ${game.titulo}`);
            } else {
                console.log(`✗ No cover found for ${game.titulo}`);
            }

            // Rate limiting - be respectful to IGDB API[citation:3]
            await new Promise(resolve => setTimeout(resolve, 250));
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.close();
    }
}

// Run the migration
migrateGOTYImages();