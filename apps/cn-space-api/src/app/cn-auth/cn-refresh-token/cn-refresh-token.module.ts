import { BL_REFRESH_TOKEN_SERVICE_PROVIDER, BlRefreshTokenCron } from '@monorepo/back-core-lib';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnRefreshToken } from './cn-refresh-token.entity';
import { CnRefreshTokenService } from './cn-refresh-token.service';

/**
 * `CnCoreConfigService`, which the service reads its lifetime from, comes from a global
 * module and so needs no import here.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CnRefreshToken])],
  providers: [
    CnRefreshTokenService,
    // The purge job is the library's; it reaches this application's service through
    // the alias, since there is no class token shared across applications.
    BlRefreshTokenCron,
    { provide: BL_REFRESH_TOKEN_SERVICE_PROVIDER, useExisting: CnRefreshTokenService },
  ],
  // The alias is exported alongside the service itself: the Authorization Server in
  // `bl-oauth-server` issues and rotates these tokens too, and it can only reach them
  // through the alias.
  exports: [TypeOrmModule, CnRefreshTokenService, BL_REFRESH_TOKEN_SERVICE_PROVIDER],
})
export class CnRefreshTokenModule {}
