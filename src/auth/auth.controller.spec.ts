import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

describe('AuthController (Senior Unit Tests)', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            loginOAuth: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login (POST /auth/login)', () => {
    const validCredentials = { email: 'john@company.com', password: 'securePassword123' };

    it('should issue a valid JWT accessToken when correct credentials are provided', async () => {
      const mockResult = { accessToken: 'jwt-access-token-xyz' };
      service.login.mockResolvedValue(mockResult);

      const result = await controller.login(validCredentials);

      expect(service.login).toHaveBeenCalledWith(validCredentials.email, validCredentials.password);
      expect(result).toEqual(mockResult);
    });

    it('should raise UnauthorizedException when incorrect password is provided', async () => {
      service.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(
        controller.login({ ...validCredentials, password: 'wrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should raise BadRequestException if email or password fields are blank', async () => {
      service.login.mockRejectedValue(new BadRequestException('Email and password are required'));

      await expect(controller.login({ email: '', password: '' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('oauthLogin (POST /auth/oauth)', () => {
    it('should successfully login and provision user context via Google Workspace OAuth2', async () => {
      const oauthDto = { provider: 'google', token: 'google-oauth-token-123' };
      const mockResult = { accessToken: 'jwt-access-token-abc' };
      service.loginOAuth.mockResolvedValue(mockResult);

      const result = await controller.oauthLogin(oauthDto);

      expect(service.loginOAuth).toHaveBeenCalledWith(oauthDto.provider, oauthDto.token);
      expect(result).toEqual(mockResult);
    });

    it('should successfully login and provision user context via Microsoft Entra ID OAuth2', async () => {
      const oauthDto = { provider: 'microsoft', token: 'microsoft-oauth-token-456' };
      const mockResult = { accessToken: 'jwt-access-token-def' };
      service.loginOAuth.mockResolvedValue(mockResult);

      const result = await controller.oauthLogin(oauthDto);

      expect(service.loginOAuth).toHaveBeenCalledWith(oauthDto.provider, oauthDto.token);
      expect(result).toEqual(mockResult);
    });

    it('should propagate UnauthorizedException when OAuth2 verification token fails', async () => {
      const oauthDto = { provider: 'google', token: 'expired-token' };
      service.loginOAuth.mockRejectedValue(new UnauthorizedException('OAuth authentication failed'));

      await expect(controller.oauthLogin(oauthDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
