import { UserRole } from '../enums/user-role.enum';

export class User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  departmentId?: string;
  phone?: string;
  profileImage?: string;
  createdAt: Date;
}
