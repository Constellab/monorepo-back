import { BlOAuthGrantEntity } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { HnUser } from '../users/hn-user.entity';

/**
 * The Community's Grant row: one user's standing approval of one client for one Resource.
 *
 * Every column and the whole of the approval logic live in `BlOAuthGrantEntity` and
 * `BlOAuthGrantService`. All that is left here is the relation to the Community's own user
 * record — the one thing the shared code cannot know.
 *
 * Deliberately the same table name and shape as the Space API's: they are two databases, and
 * one approval implementation reads both.
 */
@Entity('oauth_grant')
export class HnOAuthGrant extends BlOAuthGrantEntity<HnUser> {
  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { nullable: false, onDelete: 'CASCADE' })
  user!: HnUser;
}
