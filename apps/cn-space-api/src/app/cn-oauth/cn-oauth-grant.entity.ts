import { BlOAuthGrantEntity } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { CnUserEntity } from '../cn-users/cn-user.entity';

/**
 * The Space API's Grant row: one user's standing approval of one client for one Resource.
 *
 * Every column and the whole of the approval logic live in `BlOAuthGrantEntity` and
 * `BlOAuthGrantService`. All that is left here is the relation to this application's own
 * user record — the one thing the shared code cannot know, exactly as for `CnRefreshToken`.
 *
 * `onDelete: CASCADE` because a deleted user has approved nothing: their Grants must not
 * outlive them as rows a re-created client could match against.
 */
@Entity('oauth_grant')
export class CnOAuthGrant extends BlOAuthGrantEntity<CnUserEntity> {
  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { nullable: false, onDelete: 'CASCADE' })
  user!: CnUserEntity;
}
