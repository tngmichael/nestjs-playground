import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(returns => [User], { name: 'usersList' })
  async getAll(): Promise<any> {
    const results = await this.userService.findAll();
    return {
      results,
      total: results.length,
    };
  }

  @Mutation(returns => User, { name: 'createUser' })
  async create(@Args('input') input: Partial<User>): Promise<User> {
    return this.userService.create(input);
  }
}
