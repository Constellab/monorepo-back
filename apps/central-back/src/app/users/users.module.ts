import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from './user.entity';
import {CoreModule} from '../core/core.module';
import { UserAccountsService } from './users-account/user-accounts.service';
import { UserAccountsController } from './users-account/user-accounts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),

    CoreModule,
  ],
  providers: [UsersService, UserAccountsService],
  controllers: [UsersController, UserAccountsController],
  exports: [UsersService, UserAccountsService]
})
export class UsersModule {
}

