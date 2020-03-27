import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private readonly users: User[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', isActive: true },
  ];

  findAll(): User[] {
    return this.users;
  }

  create(input: Partial<User>): User {
    const newUser = {
      id: this.users.length + 1,
      firstName: input.firstName,
      ...input,
    };
    this.users.push(newUser);
    return newUser;
  }
}
