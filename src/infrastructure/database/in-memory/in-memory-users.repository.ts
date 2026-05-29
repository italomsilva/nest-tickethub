import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../../application/repositories/IUsersRepository';
import { User } from '../../../domain/entities/user.entity';
import { InMemoryDatabase } from './in-memory-db';

@Injectable()
export class InMemoryUsersRepository implements IUsersRepository {
  async findById(id: string): Promise<User | null> {
    const user = InMemoryDatabase.users.find(u => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = InMemoryDatabase.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async create(user: User): Promise<User> {
    InMemoryDatabase.users.push(user);
    return user;
  }

  async save(user: User): Promise<User> {
    const idx = InMemoryDatabase.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      InMemoryDatabase.users[idx] = user;
    } else {
      InMemoryDatabase.users.push(user);
    }
    return user;
  }
}
