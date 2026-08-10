import { BlOAuthGrantService } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnUser } from '../users/hn-user.entity';
import { HnOAuthGrant } from './hn-oauth-grant.entity';

/**
 * The Community's Grants.
 *
 * Recording an approval, reading it back and ending it are the library's; this binds them
 * to the Community's table and its user record.
 */
@Injectable()
export class HnOAuthGrantService extends BlOAuthGrantService<HnUser> {
  constructor(@InjectRepository(HnOAuthGrant) repository: Repository<HnOAuthGrant>) {
    super(repository);
  }
}
