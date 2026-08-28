import { BlRefreshTokenService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CnCoreConfigService } from '../../cn-core/modules/cn-core-config/cn-core-config.service';
import { CnUserEntity } from '../../cn-users/cn-user.entity';
import { CnRefreshToken } from './cn-refresh-token.entity';

/**
 * The Space API's refresh tokens.
 *
 * Issue, rotation, replay detection and purge are the library's; this binds them to this
 * application's table, its configured lifetime, and its user record — which is what
 * makes `rotate` hand back a `CnUserEntity` its callers can mint an access token from.
 */
@Injectable()
export class CnRefreshTokenService extends BlRefreshTokenService<CnUserEntity> {
  constructor(
    @InjectRepository(CnRefreshToken) repository: Repository<CnRefreshToken>,
    configService: CnCoreConfigService
  ) {
    super(repository, () => configService.getRefreshTokenDurationInSeconds());
  }
}
