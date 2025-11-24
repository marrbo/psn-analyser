// src/lib/psn/auth.ts
export class PSNAuth {
  private accessToken: string | null = null;
  
  // Credenciais IDÊNTICAS ao script PowerShell
  private readonly CLIENT_ID = '09515159-7237-4370-9b40-3806e67c0891';
  private readonly BASE64_AUTH = 'MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=';
  private readonly REDIRECT_URI = 'com.scee.psxandroid.scecompcall://redirect';

  async authenticate(): Promise<string | null> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const npsso = process.env.PSN_NPSSO_TOKEN;
    if (!npsso) {
      throw new Error('PSN_NPSSO_TOKEN não encontrado');
    }

    console.log('🚀 Iniciando autenticação PSN com client_id do PowerShell...');

    try {
      // Método IDÊNTICO ao PowerShell - espera o 302 e extrai o code
      const authCode = await this.getAuthCodePowerShellMethod(npsso);
      console.log('✅ Código de autorização obtido:', authCode);

      const tokenData = await this.exchangeCodeForToken(authCode);
      console.log('✅ Access token obtido com sucesso');

      this.accessToken = tokenData.access_token;
      return this.accessToken;
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

    console.log('📤 Fazendo requisição de autorização (PowerShell method)...');

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

      console.log(`📥 Status esperado 302, recebido: ${response.status}`);

      // NOVA LÓGICA: 302 é o comportamento esperado e correto
      if (response.status === 302) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error('Header location não encontrado no redirecionamento 302');
        }

        console.log(`📍 Location: ${location}`);

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

  private async exchangeCodeForToken(authCode: string): Promise<any> {
    console.log('🔄 Trocando código por access token...');

    const body = new URLSearchParams({
      'code': authCode,
      'redirect_uri': this.REDIRECT_URI,
      'grant_type': 'authorization_code',
      'token_format': 'jwt' // ADICIONADO: igual ao PowerShell
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

    console.log(`📥 Status token exchange: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro no token exchange:', errorText);
      throw new Error(`Falha no token exchange: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();
    console.log('✅ Token exchange realizado com sucesso');
    
    return tokenData;
  }

  async getToken(): Promise<string | null> {
    return await this.authenticate();
  }
}