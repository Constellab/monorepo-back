import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnGroupsModule } from '../../cn-groups/cn-groups.module';
import { CnNotificationModule } from '../../cn-notification/cn-notification.module';
import { CnSpacesModule } from '../../cn-spaces/cn-spaces.module';
import { CnSupportModule } from '../../cn-support/cn-support.module';
import { CnUserEntity } from '../cn-user.entity';
import { CnUsersModule } from '../cn-users.module';
import { CnUserAccountListener } from './cn-user-account.listener';
import { CnUserAccountsController } from './cn-user-accounts.controller';
import { CnUserAccountsService } from './cn-user-accounts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnUserEntity]),

    CnCoreModule,
    CnNotificationModule,
    CnUsersModule,
    CnSpacesModule,
    CnGroupsModule,
    CnSupportModule,
  ],
  providers: [CnUserAccountsService, CnUserAccountListener],
  controllers: [CnUserAccountsController],
})
export class CnUserAccountModule {}
