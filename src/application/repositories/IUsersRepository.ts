import { User } from '../../domain/entities/user.entity';

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  save(user: User): Promise<User>;
}
