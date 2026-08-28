import { BlOAuthGrantService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CnUserEntity } from '../cn-users/cn-user.entity';
import { CnOAuthGrant } from './cn-oauth-grant.entity';

/**
 * The Space API's Grants.
 *
 * Recording an approval, reading it back and ending it are the library's; this binds them
 * to this application's table and its user record.
 */
@Injectable()
export class CnOAuthGrantService extends BlOAuthGrantService<CnUserEntity> {
  constructor(@InjectRepository(CnOAuthGrant) repository: Repository<CnOAuthGrant>) {
    super(repository);
  }
}
