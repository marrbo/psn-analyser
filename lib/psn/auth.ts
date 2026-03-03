// src/lib/psn/auth.ts

import { CacheService } from "./cache-service";

interface Token {
  _cacheId: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  id_token: string;
  lastUpdated: Date;
  refresh_token_expires_in: number;
  scope: string;
  token_type: string;
}

export class PSNAuth {
  private token: Token | null = null;
  private readonly cache: CacheService;
  // Credenciais IDÊNTICAS ao script PowerShell
  private readonly CLIENT_ID = '09515159-7237-4370-9b40-3806e67c0891';
  private readonly BASE64_AUTH = 'MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=';
  private readonly REDIRECT_URI = 'com.scee.psxandroid.scecompcall://redirect';
  private readonly npsso = process.env.PSN_NPSSO_TOKEN;


  constructor() {
    if (!this.npsso) {
      throw new Error('PSN_NPSSO_TOKEN não encontrado');
    }

    this.cache = new CacheService(this.npsso, 'tokens');
  }

  private getExpired(token: Token): boolean {
    if (token) {
      const expirationDate = new Date(
        new Date(token.lastUpdated || new Date()).getTime() + token.expires_in * 1000
      ).toISOString();  

      return new Date(expirationDate).getTime() < new Date().getTime();
    }
    return true;
  }

  private accessTokenExpired(): boolean {
    let expired = true;
    if (this.token) {
      expired = this.getExpired(this.token);
    }
    return expired;
  }

  private refreshTokenExpired(): boolean {
    let expired = true;
    if (this.token) {
      expired = this.getExpired(this.token)
    }
    return expired;
  }

  async authenticate(): Promise<Token | null> {
    this.token = await this.cache.getItem<Token>();

    // Mesmo com token válido está dando erro 401
    // forçando revalidar o token
    if (this.token && !this.refreshTokenExpired()) {
      await this.refreshToken(this.token.refresh_token);
    }

    if (this.token && !this.accessTokenExpired()) {
      return this.token;
    }

    if (this.token && this.accessTokenExpired() && !this.refreshTokenExpired()) {
      await this.refreshToken(this.token.refresh_token);
      return this.token;
    }

    if (!this.npsso) {
      throw new Error('PSN_NPSSO_TOKEN não encontrado');
    }

    try {
      // Método IDÊNTICO ao PowerShell - espera o 302 e extrai o code
      const authCode = await this.getAuthCodePowerShellMethod(this.npsso);

      const tokenData = await this.exchangeCodeForToken(authCode);
      this.token = tokenData;

      new CacheService(this.npsso, 'tokens').setItem(tokenData);

      return this.token;
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      throw error;
    }
  }

  private async getAuthCodePowerShellMethod(npsso: string): Promise<string> {
    const params = new URLSearchParams({
      'access_type': 'offline',
      'client_id': this.CLIENT_ID,
      'redirect_uri': this.REDIRECT_URI,
      'response_type': 'code',
      'scope': 'psn:mobile.v2.core psn:clientapp'
    });

    const url = `https://ca.account.sony.com/api/authz/v3/oauth/authorize?${params}`;

    try {
      // Esta requisição DEVE retornar 302 - tratamos como sucesso
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cookie': `npsso=${npsso}`,
          'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15',
        },
        redirect: 'manual' // CRÍTICO: não seguir redirecionamento automaticamente
      });


      if (response.status === 429) {
        console.log(`📍 Tente mais tarde, status 429`);
        throw new Error('Muitas solicitações, tente mais tarde');
      }

      // NOVA LÓGICA: 302 é o comportamento esperado e correto
      if (response.status === 302) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error('Header location não encontrado no redirecionamento 302');
        }

        // Extrair code da URL exatamente como no PowerShell
        const urlObj = new URL(location);
        const code = urlObj.searchParams.get('code');

        if (!code) {
          throw new Error(`Code não encontrado na URL de redirecionamento: ${location}`);
        }

        return code;
      }
      // Se não for 302, verificar se é 400 com mensagem de erro
      else if (response.status === 400) {
        const errorData = await response.json();
        console.error('❌ Erro 400 da API:', errorData);
        throw new Error(`Erro de autenticação: ${errorData.error_description || errorData.error}`);
      }
      else {
        const text = await response.text();
        throw new Error(`Status inesperado: ${response.status} - ${text}`);
      }

    } catch (error) {
      console.error('❌ Erro na requisição de autorização:', error);
      throw error;
    }
  }

  private async exchangeCodeForToken(authCode: string): Promise<Token> {
    const body = new URLSearchParams({
      'code': authCode,
      'redirect_uri': this.REDIRECT_URI,
      'grant_type': 'authorization_code',
      'token_format': 'jwt'
    });

    const response = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${this.BASE64_AUTH}`,
        'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
      },
      body: body
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro no token exchange:', errorText);
      throw new Error(`Falha no token exchange: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();
    
    return tokenData;
  }

  private async refreshToken(refresh_token: string): Promise<void> {

    const body = new URLSearchParams({
      'refresh_token': refresh_token,
      'grant_type': 'refresh_token',
      'token_format': 'jwt',
      'scope': 'psn:mobile.v2.core psn:clientapp'
    });

    const response = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${this.BASE64_AUTH}`,
        'User-Agent': 'Mozilla/5.0 (PlayStation 4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
      },
      body: body
    });

    if (!response.ok) {
      const errorText = await response.json();
      console.error('❌ Erro no refreshToken: code: {0}, error: {1}', errorText.error_code, errorText.error_description);
      throw new Error(`Falha no refreshToken: ${response.status} - ${errorText.error_description || errorText.error}`);
    }

    const tokenData = await response.json();

    this.token = tokenData;
  }

  async getAccessToken(): Promise<string | null> {
    const token = await this.authenticate();
    
    if (token === null) {
      return null;
    }
    return token?.access_token;
  }

  async getToken(): Promise<Token | null> {
    return await this.authenticate();
  }
}