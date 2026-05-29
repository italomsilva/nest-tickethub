import { Injectable } from '@nestjs/common';
import { IOAuthGateway, OAuthUser } from '../../application/gateways/oauth.gateway';

@Injectable()
export class MockOAuthGateway implements IOAuthGateway {
  async verifyToken(provider: string, token: string): Promise<OAuthUser> {
    // Return a mock user for login / automatic provisioning
    return {
      email: `oauth.${provider}.user@empresa.com`,
      name: `OAuth ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
    };
  }
}
