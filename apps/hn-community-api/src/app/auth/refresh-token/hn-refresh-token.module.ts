import { BL_REFRESH_TOKEN_SERVICE_PROVIDER, BlRefreshTokenCron } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnCoreModule } from '../../core/hn-core.module';
import { HnRefreshToken } from './hn-refresh-token.entity';
import { HnRefreshTokenService } from './hn-refresh-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnRefreshToken]), HnCoreModule],
  providers: [
    HnRefreshTokenService,
    // The purge job is the library's; it reaches this application's service through
    // the alias, since there is no class token shared across applications.
    BlRefreshTokenCron,
    { provide: BL_REFRESH_TOKEN_SERVICE_PROVIDER, useExisting: HnRefreshTokenService },
  ],
  // The alias is exported alongside the service itself: the Authorization Server in
  // `bl-oauth-server` issues and rotates these tokens too, and it can only reach them
  // through the alias.
  exports: [TypeOrmModule, HnRefreshTokenService, BL_REFRESH_TOKEN_SERVICE_PROVIDER],
})
export class HnRefreshTokenModule {}
