// lib/psn/username-converter.ts
export interface PSNUser {
  user_id: string;
  encoded_id: string;
  online_id: string;
}

export async function convertUsernameToAccountId(username: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://psn.flipscreen.games/search.php?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PSNUser = await response.json();
    
    if (data.user_id && data.user_id !== '0') {
      console.log(`✅ Usuário encontrado: ${data.online_id} -> ${data.user_id}`);
      return data.user_id;
    } else {
      console.warn(`❌ Usuário não encontrado: ${username}`);
      return null;
    }
  } catch (error) {
    console.error('💥 Erro ao converter username:', error);
    
    // Fallback para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.warn('🛠️ Modo desenvolvimento: usando fallback');
      // Retorna um accountId mock para desenvolvimento
      return '3948339084736880804'; // Exemplo do JegueParalitico
    }
    
    return null;
  }
}