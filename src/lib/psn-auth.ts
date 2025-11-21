// lib/psn-auth.ts
import { exchangeNpssoForAccessCode, exchangeAccessCodeForAuthTokens } from "psn-api";

export interface IPSNAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
  idToken?: string;
}

export class PSNAuthService {
  private static async getTokensFromNPSSO(npsso: string): Promise<IPSNAuthTokens> {
    try {
      const accessCode = await exchangeNpssoForAccessCode(npsso);
      const authorization = await exchangeAccessCodeForAuthTokens(accessCode);
      return authorization;
    } catch (error) {
      throw new Error(`PSN Authentication failed: ${error.message}`);
    }
  }

  // This will be used for the OAuth2 flow
  public static async handleOAuthCallback(code: string): Promise<IPSNAuthTokens> {
    // Implement OAuth2 code exchange
    // This requires PSN OAuth2 app registration
    const authorization = await exchangeAccessCodeForAuthTokens(code);
    return authorization;
  }

  public static getOAuthUrl(): string {
    // PSN OAuth2 authorization endpoint
    const clientId = process.env.PSN_CLIENT_ID;
    const redirectUri = process.env.PSN_REDIRECT_URI;
    const scopes = ['psn:mobile.v2.core', 'psn:clientapp'];
    
    return `https://ca.account.sony.com/api/authz/v3/oauth/authorize?` +
           `client_id=${clientId}&` +
           `redirect_uri=${encodeURIComponent(redirectUri)}&` +
           `scope=${encodeURIComponent(scopes.join(' '))}&` +
           `response_type=code&` +
           `access_type=offline`;
  }
}