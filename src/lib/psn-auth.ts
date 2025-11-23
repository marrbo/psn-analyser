// src/lib/auth/psn-auth.ts
export interface PSNAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class PSNAuthService {
  private static instance: PSNAuthService;
  private auth: PSNAuth | null = null;

  static getInstance(): PSNAuthService {
    if (!PSNAuthService.instance) {
      PSNAuthService.instance = new PSNAuthService();
    }
    return PSNAuthService.instance;
  }

  async authenticate(): Promise<PSNAuth> {
    // Se já temos um token válido, retornamos
    if (this.auth && Date.now() < this.auth.expiresAt) {
      return this.auth;
    }

    // Implementação da autenticação com a PSN
    // Isso pode variar dependendo do método de autenticação disponível
    const authData = await this.performPSNAuthentication();
    
    this.auth = {
      accessToken: authData.access_token,
      refreshToken: authData.refresh_token,
      expiresAt: Date.now() + (authData.expires_in * 1000)
    };

    return this.auth;
  }

  private async performPSNAuthentication(): Promise<any> {
    // Método 1: Usando NPSSO token (se disponível)
    const npsso = process.env.PSN_NPSSO_TOKEN;
    if (npsso) {
      return this.authenticateWithNPSSO(npsso);
    }

    // Método 2: Usando credenciais (menos comum)
    const email = process.env.PSN_EMAIL;
    const password = process.env.PSN_PASSWORD;
    if (email && password) {
      return this.authenticateWithCredentials(email, password);
    }

    throw new Error('PSN authentication credentials not found');
  }

  private async authenticateWithNPSSO(npsso: string): Promise<any> {
    // Passo 1: Trocar NPSSO por access code
    const codeResponse = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/authorize', {
      method: 'GET',
      headers: {
        'Cookie': `npsso=${npsso}`
      },
      redirect: 'manual'
    });

    // Extrair o código da URL de redirecionamento
    const location = codeResponse.headers.get('location');
    if (!location) {
      throw new Error('Failed to get authorization code from NPSSO');
    }

    const urlParams = new URLSearchParams(new URL(location).search);
    const code = urlParams.get('code');
    
    if (!code) {
      throw new Error('No authorization code found in response');
    }

    // Passo 2: Trocar code por access token
    const tokenResponse = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic YWM4ZDE2MWEtZDk2Ni00NzI4LWIwZWEtZmZlYzIyZjY5ZWRjOkRFaXhFcVhYQ2RYZHdqMHY='
      },
      body: new URLSearchParams({
        'code': code,
        'redirect_uri': 'com.scee.psxandroid.scecompcall://redirect',
        'grant_type': 'authorization_code',
        'scope': 'psn:mobile.v2.core psn:clientapp'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    return await tokenResponse.json();
  }

  private async authenticateWithCredentials(email: string, password: string): Promise<any> {
    // Implementação básica com credenciais
    // Nota: Este método é menos confiável e pode quebrar com mudanças na API
    const response = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic YWM4ZDE2MWEtZDk2Ni00NzI4LWIwZWEtZmZlYzIyZjY5ZWRjOkRFaXhFcVhYQ2RYZHdqMHY='
      },
      body: new URLSearchParams({
        'username': email,
        'password': password,
        'grant_type': 'password',
        'scope': 'psn:mobile.v2.core psn:clientapp'
      })
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    return await response.json();
  }

  getAccessToken(): string | null {
    return this.auth?.accessToken || null;
  }

  async refreshTokenIfNeeded(): Promise<void> {
    if (this.auth && Date.now() >= this.auth.expiresAt - 60000) {
      await this.authenticate();
    }
  }
}