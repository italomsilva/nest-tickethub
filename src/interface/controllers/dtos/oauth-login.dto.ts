import { IsNotEmpty, IsString } from 'class-validator';

export class OAuthLoginDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
