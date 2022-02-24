import {Module} from '@nestjs/common';
import {HnAuthService} from './hn-auth.service';
import {HnUserModule} from '../users/hn-user.module';
import {HnAuthController} from './hn-auth.controller';
import {HnCoreModule} from '../core/hn-core.module';
import {HnUserService} from '../users/hn-user.service';
import {BlExternalApiModule, BlExternalApiService} from '@monorepo/back-core-lib';
import {HttpModule} from '@nestjs/axios';


@Module({
  imports: [
    HnUserModule,
    HnCoreModule,
    HttpModule,
    BlExternalApiModule
  ],
  providers: [HnAuthService, HnUserService, BlExternalApiService],
  exports: [HnAuthService],
  controllers: [HnAuthController]
})
export class HnAuthModule {
}
