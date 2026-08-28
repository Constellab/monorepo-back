import { BlRefreshTokenService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnUser } from '../../users/hn-user.entity';
import { HnRefreshToken } from './hn-refresh-token.entity';

/**
 * The Community's refresh tokens.
 *
 * Issue, rotation, replay detection and purge are the library's; this binds them to
 * the Community's table, its configured lifetime, and its user record — which is what
 * makes `rotate` hand back an `HnUser` its callers can mint an access token from.
 */
@Injectable()
export class HnRefreshTokenService extends BlRefreshTokenService<HnUser> {
  constructor(
    @InjectRepository(HnRefreshToken) repository: Repository<HnRefreshToken>,
    configService: HnCoreConfigService
  ) {
    super(repository, () => configService.getRefreshTokenDurationInSeconds());
  }
}
