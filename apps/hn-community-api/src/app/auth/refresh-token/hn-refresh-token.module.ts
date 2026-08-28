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
  // The alias is exported alongside the service itself, though nothing outside this
  // application resolves it any more: since the cutover only browser sessions are
  // renewed here, and the Grant-kind rows an Authorization Server used to write belong
  // to the Space API. `BlRefreshTokenCron` above is the one shared consumer left.
  exports: [TypeOrmModule, HnRefreshTokenService, BL_REFRESH_TOKEN_SERVICE_PROVIDER],
})
export class HnRefreshTokenModule {}
