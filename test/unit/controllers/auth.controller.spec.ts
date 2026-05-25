import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from '../../../src/interface/controllers/auth.controller';
import { LoginUseCase } from '../../../src/application/use-cases/auth/login.use-case';
import { OAuthLoginUseCase } from '../../../src/application/use-cases/auth/oauth-login.use-case';

describe('AuthController (Clean Architecture Unit Tests)', () => {
  let controller: AuthController;
  
  let loginUseCaseMock: jest.Mocked<LoginUseCase>;
  let oauthLoginUseCaseMock: jest.Mocked<OAuthLoginUseCase>;

  beforeEach(async () => {
    loginUseCaseMock = { execute: jest.fn() } as any;
    oauthLoginUseCaseMock = { execute: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUseCase, useValue: loginUseCaseMock },
        { provide: OAuthLoginUseCase, useValue: oauthLoginUseCaseMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login (POST /auth/login)', () => {
    const validCredentials = { email: 'client@corporativo.com', password: 'securePassword123' };

    it('should successfully authenticate users when given valid credentials and return JWT accessToken', async () => {
      const expectedToken = { accessToken: 'jwt.valid.token' };
      loginUseCaseMock.execute.mockResolvedValue(expectedToken);

      const result = await controller.login(validCredentials);

      expect(result).toEqual(expectedToken);
      expect(loginUseCaseMock.execute).toHaveBeenCalledTimes(1);
      expect(loginUseCaseMock.execute).toHaveBeenCalledWith(validCredentials.email, validCredentials.password);
    });

    it('should fail and throw BadRequestException if request body details email parameter is empty', async () => {
      await expect(
        controller.login({ email: '', password: 'somePassword' }),
      ).rejects.toThrow(BadRequestException);
      expect(loginUseCaseMock.execute).not.toHaveBeenCalled();
    });

    it('should fail and throw BadRequestException if request body details password parameter is empty', async () => {
      await expect(
        controller.login({ email: 'client@corporativo.com', password: '' }),
      ).rejects.toThrow(BadRequestException);
      expect(loginUseCaseMock.execute).not.toHaveBeenCalled();
    });
  });

  describe('oauthLogin (POST /auth/oauth)', () => {
    const oauthPayload = { provider: 'google', token: 'oauth.client.id.token' };

    it('should successfully provision new profiles or login existing accounts via external OAuth Single Sign-On credentials', async () => {
      const expectedToken = { accessToken: 'jwt.oauth.valid.token' };
      oauthLoginUseCaseMock.execute.mockResolvedValue(expectedToken);

      const result = await controller.oauthLogin(oauthPayload);

      expect(result).toEqual(expectedToken);
      expect(oauthLoginUseCaseMock.execute).toHaveBeenCalledTimes(1);
      expect(oauthLoginUseCaseMock.execute).toHaveBeenCalledWith(oauthPayload.provider, oauthPayload.token);
    });
  });
});
