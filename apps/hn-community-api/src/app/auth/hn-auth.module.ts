import { BlExternalApiModule, BlExternalApiService } from '@monorepo/back-core-lib';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { HnCoreModule } from '../core/hn-core.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnUserService } from '../users/hn-user.service';
import { HnAuthController } from './hn-auth.controller';
import { HnAuthService } from './hn-auth.service';
import { HnSpaceAuthService } from './hn-space-auth.service';
import { HnRefreshTokenModule } from './refresh-token/hn-refresh-token.module';

@Module({
  imports: [HnUserModule, HnCoreModule, HttpModule, BlExternalApiModule, HnRefreshTokenModule],
  providers: [HnAuthService, HnUserService, BlExternalApiService, HnSpaceAuthService],
  exports: [HnAuthService],
  controllers: [HnAuthController],
})
export class HnAuthModule {}
