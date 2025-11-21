// types/fusionauth.ts
export interface FusionAuthUser {
  id: string;
  email: string;
  verified: boolean;
  username?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export interface FusionAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

export interface FusionAuthResponse {
  user: FusionAuthUser;
  tokens: FusionAuthTokens;
}