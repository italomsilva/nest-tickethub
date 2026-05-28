export interface ITokenGateway {
  generate(payload: any): Promise<string>;
  verify(token: string): Promise<any>;
}
