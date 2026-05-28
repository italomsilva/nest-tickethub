export interface OAuthUser {
  email: string;
  name: string;
}

export interface IOAuthGateway {
  verifyToken(provider: string, token: string): Promise<OAuthUser>;
}
