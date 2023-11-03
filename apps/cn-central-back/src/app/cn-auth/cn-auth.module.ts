import {Module} from '@nestjs/common';
import {CnAuthService} from './cn-auth.service';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnAuthController} from './cn-auth.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnUser2FA} from './cn-user-2-f-a/cn-user-2-f-a.entity';
import {CnUser2FAService} from './cn-user-2-f-a/cn-user-2-f-a.service';
import {CnUser} from '../cn-users/cn-user.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([CnUser2FA, CnUser]),

    CnUsersModule,
  ],
  providers: [
    CnAuthService,
    CnUser2FAService,
  ],
  controllers: [
    CnAuthController,
  ],
  exports: [
    CnAuthService,
  ]
})
export class CnAuthModule {
}
