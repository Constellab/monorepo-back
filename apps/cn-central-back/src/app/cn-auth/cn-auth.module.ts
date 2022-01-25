import {Module} from '@nestjs/common';
import {CnAuthService} from './cn-auth.service';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnAuthController} from './cn-auth.controller';
import {CnCoreModule} from '../cn-core/cn-core.module';


@Module({
  imports: [
    CnUsersModule,
    CnCoreModule,
  ],
  providers: [CnAuthService],
  exports: [CnAuthService],
  controllers: [CnAuthController]
})
export class CnAuthModule {
}
