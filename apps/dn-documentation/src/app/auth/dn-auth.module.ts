import {HttpModule, Module} from '@nestjs/common';
import {DnAuthService} from './dn-auth.service';
import {DnUserModule} from '../users/dn-user.module';
import {DnAuthController} from './dn-auth.controller';
import {DnCoreModule} from '../core/dn-core.module';
import {DnUserService} from '../users/dn-user.service';
import {BlExternalApiModule, BlExternalApiService} from '@monorepo/back-core-lib';


@Module({
  imports: [
    DnUserModule,
    DnCoreModule,
    HttpModule,
    BlExternalApiModule
  ],
  providers: [DnAuthService, DnUserService, BlExternalApiService],
  exports: [DnAuthService],
  controllers: [DnAuthController]
})
export class DnAuthModule {
}
