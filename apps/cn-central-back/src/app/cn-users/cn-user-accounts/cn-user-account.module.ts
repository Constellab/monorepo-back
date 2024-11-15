import { Module } from '@nestjs/common';
import { CnUserAccountsController } from './cn-user-accounts.controller';
import { CnUserAccountsService } from './cn-user-accounts.service';
import { CnNotificationModule } from '../../cn-notification/cn-notification.module';
import { CnUsersModule } from '../cn-users.module';
import { CnSpacesModule } from '../../cn-spaces/cn-spaces.module';
import { CnGroupsModule } from '../../cn-groups/cn-groups.module';
import { CnUserAccountListener } from './cn-user-account.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnUserEntity } from '../cn-user.entity';
import { CnCoreModule } from '../../cn-core/cn-core.module';
import { CnSupportModule } from '../../cn-support/cn-support.module';

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
