// src/lib/psn/simple-auth.ts
export class SimplePSNAuth {
  private accessToken: string | null = null;

  async authenticate(): Promise<string> {
    const npsso = process.env.PSN_NPSSO_TOKEN;
    if (!npsso) {
      throw new Error('PSN_NPSSO_TOKEN não encontrado');
    }

    // Implementação simplificada baseada em bibliotecas conhecidas
    const authCode = await this.getAuthCodeWithNPSSO(npsso);
    const token = await this.exchangeCodeForToken(authCode);
    
    this.accessToken = token;
    return token;
  }

  private async getAuthCodeWithNPSSO(npsso: string): Promise<string> {
    // Abordagem mais direta
    const response = await fetch(
      'https://ca.account.sony.com/api/authz/v3/oauth/authorize?access_type=offline&client_id=ac8d161a-d966-4728-b0ea-ffec22f69edc&redirect_uri=com.scee.psxandroid.scecompcall://redirect&response_type=code&scope=psn:mobile.v2.core%20psn:clientapp',
      {
        method: 'GET',
        headers: {
          'Cookie': `npsso=${npsso}`,
          'User-Agent': 'Mozilla/5.0 (PlayStation; PlayStation 5/2.26) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15'
        },
        redirect: 'manual'
      }
    );

    if (response.status !== 302) {
      throw new Error(`Expected 302 redirect, got ${response.status}`);
    }

    const location = response.headers.get('location');
    if (!location) {
      throw new Error('No location header in response');
    }

    // Extrair code da URL
    const urlParams = new URLSearchParams(new URL(location).search);
    const code = urlParams.get('code');

    if (!code) {
      throw new Error('No code found in redirect URL');
    }

    return code;
  }

  private async exchangeCodeForToken(authCode: string): Promise<string> {
    const response = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic YWM4ZDE2MWEtZDk2Ni00NzI4LWIwZWEtZmZlYzIyZjY5ZWRjOkRFaXhFcVhYQ2RYZHdqMHY='
      },
      body: new URLSearchParams({
        'code': authCode,
        'redirect_uri': 'com.scee.psxandroid.scecompcall://redirect',
        'grant_type': 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async getToken(): Promise<string> {
    if (!this.accessToken) {
      return await this.authenticate();
    }
    return this.accessToken;
  }
}