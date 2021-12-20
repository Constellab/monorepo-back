import {Module} from '@nestjs/common';
import {CnUsersService} from './cn-users.service';
import {CnUsersController} from './cn-users.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnUser} from './cn-user.entity';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnUserAccountsService} from './cn-users-account/cn-user-accounts.service';
import {CnUserAccountsController} from './cn-users-account/cn-user-accounts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnUser]),

    CnCoreModule,
  ],
  providers: [CnUsersService, CnUserAccountsService],
  controllers: [CnUsersController, CnUserAccountsController],
  exports: [CnUsersService, CnUserAccountsService]
})
export class CnUsersModule {
}

