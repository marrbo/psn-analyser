import { 
  exchangeNpssoForAccessCode, 
  exchangeAccessCodeForAuthTokens 
} from "psn-api";

export interface IPSNAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}

export class PSNAuth {
  static async authenticate(npsso: string): Promise<IPSNAuthTokens> {
    try {
      if (!npsso || npsso.length < 10) {
        throw new Error('NPSSO inválido. O token deve ter pelo menos 10 caracteres.');
      }

      console.log('🔑 Trocando NPSSO por access code...');
      const accessCode = await exchangeNpssoForAccessCode(npsso);
      
      console.log('🔄 Trocando access code por tokens de autenticação...');
      const authorization = await exchangeAccessCodeForAuthTokens(accessCode);
      
      console.log('✅ Autenticação com PSN realizada com sucesso!');
      return authorization;
    } catch (error: any) {
      if (error.message?.includes('invalid_npsso')) {
        throw new Error('NPSSO inválido ou expirado. Obtenha um novo NPSSO seguindo o guia em nosso site.');
      }
      
      if (error.message?.includes('rate limit')) {
        throw new Error('Limite de requisições excedido. A PSN limita o número de autenticações. Tente novamente em 1 hora.');
      }
      
      throw new Error(`Falha na autenticação com a PSN: ${error.message}`);
    }
  }
}