import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { DateScalar } from 'src/common/date.scalar';

@Module({
  providers: [UserService, UserResolver, DateScalar],
})
export class UserModule {}
