import {Module} from '@nestjs/common';
import {CnAuthService} from './cn-auth.service';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnAuthController} from './cn-auth.controller';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnUser2FA} from './cn-user-2-f-a/cn-user-2-f-a.entity';
import {CnUser2FAService} from './cn-user-2-f-a/cn-user-2-f-a.service';
import {CnUserAccountsService} from './cn-users-account/cn-user-accounts.service';
import {CnUserAccountsController} from './cn-users-account/cn-user-accounts.controller';
import {CnSpacesModule} from '../cn-spaces/cn-spaces.module';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnGroupsModule} from '../cn-groups/cn-groups.module';
import {CnNotificationModule} from '../cn-notification/cn-notification.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([CnUser2FA, CnUser]),

    CnUsersModule,
    CnCoreModule,
    CnSpacesModule,
    CnGroupsModule,
    CnNotificationModule,
  ],
  providers: [
    CnAuthService,
    CnUser2FAService,
    CnUserAccountsService
  ],
  controllers: [
    CnAuthController,
    CnUserAccountsController
  ],
  exports: [
    CnAuthService,
  ]
})
export class CnAuthModule {
}
