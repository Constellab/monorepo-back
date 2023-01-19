import {Module} from '@nestjs/common';
import {HnAuthService} from './hn-auth.service';
import {HnUserModule} from '../users/hn-user.module';
import {HnAuthController} from './hn-auth.controller';
import {HnCoreModule} from '../core/hn-core.module';
import {HnUserService} from '../users/hn-user.service';
import {BlExternalApiModule, BlExternalApiService} from '@monorepo/back-core-lib';
import {HttpModule} from '@nestjs/axios';
import {HnCentralAuthService} from './hn-central-auth.service';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';


@Module({
  imports: [
    HnUserModule,
    HnCoreModule,
    HttpModule,
    BlExternalApiModule
  ],
  providers: [HnAuthService, HnUserService, BlExternalApiService,
    HnCentralAuthService, HnCoreConfigService],
  exports: [HnAuthService],
  controllers: [HnAuthController]
})
export class HnAuthModule {
}
